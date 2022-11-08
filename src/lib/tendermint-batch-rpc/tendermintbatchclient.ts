import {
  iavlSpec,
  ics23,
  tendermintSpec,
  verifyExistence,
  verifyNonExistence
} from '@confio/ics23';
import { toAscii, toHex } from '@cosmjs/encoding';
import { JsonRpcId } from '@cosmjs/json-rpc/build/types';
import { ProvenQuery } from '@cosmjs/stargate/build/queryclient/queryclient';
import { firstEvent } from '@cosmjs/stream';
import { createJsonRpcRequest } from '@cosmjs/tendermint-rpc/build/jsonrpc';
import {
  HttpEndpoint,
  instanceOfRpcStreamingClient,
  SubscriptionEvent
} from '@cosmjs/tendermint-rpc/build/rpcclients';
import * as tendermint34 from '@cosmjs/tendermint-rpc/build/tendermint34';
import {
  adaptor35,
  Decoder,
  Encoder,
  Params,
  Responses
} from '@cosmjs/tendermint-rpc/build/tendermint35/adaptor';
import * as requests from '@cosmjs/tendermint-rpc/build/tendermint35/requests';
import * as responses
  from '@cosmjs/tendermint-rpc/build/tendermint35/responses';
import {
  arrayContentEquals,
  assert,
  assertDefined,
  sleep
} from '@cosmjs/utils';
import { Stream } from 'xstream';

import { BatchHttpClient } from './batchhttpclient';
import { BatchRpcClient } from './batchrpcclient';

function checkAndParseOp(
  op: tendermint34.ProofOp,
  kind: string,
  key: Uint8Array
): ics23.CommitmentProof {
  if (op.type !== kind) {
    throw new Error(`Op expected to be ${kind}, got "${op.type}`);
  }
  if (!arrayContentEquals(key, op.key)) {
    throw new Error(
      `Proven key different than queried key.\nQuery: ${toHex(
        key
      )}\nProven: ${toHex(op.key)}`
    );
  }
  return ics23.CommitmentProof.decode(op.data);
}

export class TendermintBatchClient {
  /**
   * Creates a new Tendermint client for the given endpoint.
   *
   * Uses HTTP when the URL schema is http or https. Uses WebSockets otherwise.
   */
  public static async connect(
    endpoint: string | HttpEndpoint
  ): Promise<TendermintBatchClient> {
    if (typeof endpoint === 'object') {
      return TendermintBatchClient.create(new BatchHttpClient(endpoint));
    } else {
      const useHttp =
        endpoint.startsWith('http://') || endpoint.startsWith('https://');
      const rpcClient = useHttp
        ? new BatchHttpClient(endpoint)
        : new BatchHttpClient(endpoint);
      return TendermintBatchClient.create(rpcClient);
    }
  }

  /**
   * Creates a new Tendermint client given an RPC client.
   */
  public static async create(
    rpcClient: BatchRpcClient
  ): Promise<TendermintBatchClient> {
    // For some very strange reason I don't understand, tests start to fail on some systems
    // (our CI) when skipping the status call before doing other queries. Sleeping a little
    // while did not help. Thus we query the version as a way to say "hi" to the backend,
    // even in cases where we don't use the result.
    const _version = await this.detectVersion(rpcClient);
    return new TendermintBatchClient(rpcClient);
  }

  private static async detectVersion(client: BatchRpcClient): Promise<string> {
    const req = createJsonRpcRequest(requests.Method.Status);
    const response = await client.execute(req);
    const result = response.result;

    if (!result || !result.node_info) {
      throw new Error('Unrecognized format for status response');
    }

    const version = result.node_info.version;
    if (typeof version !== 'string') {
      throw new Error('Unrecognized version format: must be string');
    }
    return version;
  }

  private readonly client: BatchRpcClient;
  private batchRequests;
  private batchDecoders;
  private readonly p: Params;
  private readonly r: Responses;

  /**
   * Use `Tendermint34Client.connect` or `Tendermint34Client.create` to create an instance.
   */
  private constructor(client: BatchRpcClient) {
    this.client = client;
    this.p = adaptor35.params;
    this.r = adaptor35.responses;
    this.batchRequests = [];
    this.batchDecoders = [];
  }

  public disconnect(): void {
    this.client.disconnect();
  }

  public async abciInfo(id?: JsonRpcId): Promise<responses.AbciInfoResponse> {
    const query: requests.AbciInfoRequest = {
      method: requests.Method.AbciInfo
    };
    return this.addCall(query, this.p.encodeAbciInfo, this.r.decodeAbciInfo, id);
  }

  public async abciQuery(
    params: requests.AbciQueryParams,
    id?: JsonRpcId
  ): Promise<responses.AbciQueryResponse> {
    const query: requests.AbciQueryRequest = {
      params: params,
      method: requests.Method.AbciQuery
    };
    return this.addCall(query, this.p.encodeAbciQuery, this.r.decodeAbciQuery, id);
  }

  public async block(height?: number, id?: JsonRpcId): Promise<responses.BlockResponse> {
    const query: requests.BlockRequest = {
      method: requests.Method.Block,
      params: { height: height }
    };
    return this.addCall(query, this.p.encodeBlock, this.r.decodeBlock, id);
  }

  public async blockResults(
    height?: number,
    id?: JsonRpcId
  ): Promise<responses.BlockResultsResponse> {
    const query: requests.BlockResultsRequest = {
      method: requests.Method.BlockResults,
      params: { height: height }
    };
    return this.addCall(
      query,
      this.p.encodeBlockResults,
      this.r.decodeBlockResults,
      id
    );
  }

  /**
   * Search for events that are in a block.
   *
   * NOTE
   * This method will error on any node that is running a Tendermint version lower than 0.34.9.
   *
   * @see https://docs.tendermint.com/master/rpc/#/Info/block_search
   */
  public async blockSearch(
    params: requests.BlockSearchParams,
    id?: JsonRpcId
  ): Promise<responses.BlockSearchResponse> {
    const query: requests.BlockSearchRequest = {
      params: params,
      method: requests.Method.BlockSearch
    };
    const resp = await this.addCall(
      query,
      this.p.encodeBlockSearch,
      this.r.decodeBlockSearch,
      id
    );
    return {
      ...resp,
      // make sure we sort by height, as tendermint may be sorting by string value of the height
      blocks: [...resp.blocks].sort(
        (a, b) => a.block.header.height - b.block.header.height
      )
    };
  }

  // this should paginate through all blockSearch options to ensure it returns all results.
  // starts with page 1 or whatever was provided (eg. to start on page 7)
  //
  // NOTE
  // This method will error on any node that is running a Tendermint version lower than 0.34.9.
  public async blockSearchAll(
    params: requests.BlockSearchParams
  ): Promise<responses.BlockSearchResponse> {
    let page = params.page || 1;
    const blocks: responses.BlockResponse[] = [];
    let done = false;

    while (!done) {
      const resp = await this.blockSearch({ ...params, page: page });
      blocks.push(...resp.blocks);
      if (blocks.length < resp.totalCount) {
        page++;
      } else {
        done = true;
      }
    }
    // make sure we sort by height, as tendermint may be sorting by string value of the height
    // and the earlier items may be in a higher page than the later items
    blocks.sort((a, b) => a.block.header.height - b.block.header.height);

    return {
      totalCount: blocks.length,
      blocks: blocks
    };
  }

  /**
   * Queries block headers filtered by minHeight <= height <= maxHeight.
   *
   * @param minHeight The minimum height to be included in the result. Defaults to 0.
   * @param maxHeight The maximum height to be included in the result. Defaults to infinity.
   */
  public async blockchain(
    minHeight?: number,
    maxHeight?: number,
    id?: JsonRpcId
  ): Promise<responses.BlockchainResponse> {
    const query: requests.BlockchainRequest = {
      method: requests.Method.Blockchain,
      params: {
        minHeight: minHeight,
        maxHeight: maxHeight
      }
    };
    return this.addCall(
      query,
      this.p.encodeBlockchain,
      this.r.decodeBlockchain,
      id
    );
  }

  /**
   * Broadcast transaction to mempool and wait for response
   *
   * @see https://docs.tendermint.com/master/rpc/#/Tx/broadcast_tx_sync
   */
  public async broadcastTxSync(
    params: requests.BroadcastTxParams,
    id?: JsonRpcId
  ): Promise<responses.BroadcastTxSyncResponse> {
    const query: requests.BroadcastTxRequest = {
      params: params,
      method: requests.Method.BroadcastTxSync
    };
    return this.addCall(
      query,
      this.p.encodeBroadcastTx,
      this.r.decodeBroadcastTxSync,
      id
    );
  }

  /**
   * Broadcast transaction to mempool and do not wait for result
   *
   * @see https://docs.tendermint.com/master/rpc/#/Tx/broadcast_tx_async
   */
  public async broadcastTxAsync(
    params: requests.BroadcastTxParams,
    id?: JsonRpcId
  ): Promise<responses.BroadcastTxAsyncResponse> {
    const query: requests.BroadcastTxRequest = {
      params: params,
      method: requests.Method.BroadcastTxAsync
    };
    return this.addCall(
      query,
      this.p.encodeBroadcastTx,
      this.r.decodeBroadcastTxAsync,
      id
    );
  }

  /**
   * Broadcast transaction to mempool and wait for block
   *
   * @see https://docs.tendermint.com/master/rpc/#/Tx/broadcast_tx_commit
   */
  public async broadcastTxCommit(
    params: requests.BroadcastTxParams,
    id?: JsonRpcId
  ): Promise<responses.BroadcastTxCommitResponse> {
    const query: requests.BroadcastTxRequest = {
      params: params,
      method: requests.Method.BroadcastTxCommit
    };
    return this.addCall(
      query,
      this.p.encodeBroadcastTx,
      this.r.decodeBroadcastTxCommit,
      id
    );
  }

  public async commit(height?: number, id?: JsonRpcId): Promise<responses.CommitResponse> {
    const query: requests.CommitRequest = {
      method: requests.Method.Commit,
      params: { height: height }
    };
    return this.addCall(query, this.p.encodeCommit, this.r.decodeCommit, id);
  }

  public async genesis(id?: JsonRpcId): Promise<responses.GenesisResponse> {
    const query: requests.GenesisRequest = { method: requests.Method.Genesis };
    return this.addCall(query, this.p.encodeGenesis, this.r.decodeGenesis, id);
  }

  public async health(id?: JsonRpcId): Promise<responses.HealthResponse> {
    const query: requests.HealthRequest = { method: requests.Method.Health };
    return this.addCall(query, this.p.encodeHealth, this.r.decodeHealth, id);
  }

  public async numUnconfirmedTxs(id?: JsonRpcId): Promise<responses.NumUnconfirmedTxsResponse> {
    const query: requests.NumUnconfirmedTxsRequest = {
      method: requests.Method.NumUnconfirmedTxs
    };
    return this.addCall(
      query,
      this.p.encodeNumUnconfirmedTxs,
      this.r.decodeNumUnconfirmedTxs,
      id
    );
  }

  public async status(id?: JsonRpcId): Promise<responses.StatusResponse> {
    const query: requests.StatusRequest = { method: requests.Method.Status };
    return this.addCall(query, this.p.encodeStatus, this.r.decodeStatus, id);
  }

  public subscribeNewBlock(): Stream<responses.NewBlockEvent> {
    const request: requests.SubscribeRequest = {
      method: requests.Method.Subscribe,
      query: { type: requests.SubscriptionEventType.NewBlock }
    };
    return this.subscribe(request, this.r.decodeNewBlockEvent);
  }

  public subscribeNewBlockHeader(): Stream<responses.NewBlockHeaderEvent> {
    const request: requests.SubscribeRequest = {
      method: requests.Method.Subscribe,
      query: { type: requests.SubscriptionEventType.NewBlockHeader }
    };
    return this.subscribe(request, this.r.decodeNewBlockHeaderEvent);
  }

  public subscribeTx(query?: string): Stream<responses.TxEvent> {
    const request: requests.SubscribeRequest = {
      method: requests.Method.Subscribe,
      query: {
        type: requests.SubscriptionEventType.Tx,
        raw: query
      }
    };
    return this.subscribe(request, this.r.decodeTxEvent);
  }

  /**
   * Get a single transaction by hash
   *
   * @see https://docs.tendermint.com/master/rpc/#/Info/tx
   */
  public async tx(params: requests.TxParams, id?: JsonRpcId): Promise<responses.TxResponse> {
    const query: requests.TxRequest = {
      params: params,
      method: requests.Method.Tx
    };
    return this.addCall(query, this.p.encodeTx, this.r.decodeTx, id);
  }

  /**
   * Search for transactions that are in a block
   *
   * @see https://docs.tendermint.com/master/rpc/#/Info/tx_search
   */
  public async txSearch(
    params: requests.TxSearchParams,
    id?: JsonRpcId
  ): Promise<responses.TxSearchResponse> {
    const query: requests.TxSearchRequest = {
      params: params,
      method: requests.Method.TxSearch
    };
    return this.addCall(query, this.p.encodeTxSearch, this.r.decodeTxSearch, id);
  }

  // this should paginate through all txSearch options to ensure it returns all results.
  // starts with page 1 or whatever was provided (eg. to start on page 7)
  public async txSearchAll(
    params: requests.TxSearchParams
  ): Promise<responses.TxSearchResponse> {
    let page = params.page || 1;
    const txs: responses.TxResponse[] = [];
    let done = false;

    while (!done) {
      const resp = await this.txSearch({ ...params, page: page });
      txs.push(...resp.txs);
      if (txs.length < resp.totalCount) {
        page++;
      } else {
        done = true;
      }
    }

    return {
      totalCount: txs.length,
      txs: txs
    };
  }

  public async validators(
    params: requests.ValidatorsParams,
    id?: JsonRpcId
  ): Promise<responses.ValidatorsResponse> {
    const query: requests.ValidatorsRequest = {
      method: requests.Method.Validators,
      params: params
    };
    return this.addCall(
      query,
      this.p.encodeValidators,
      this.r.decodeValidators,
      id
    );
  }

  public async validatorsAll(
    height?: number,
    id?: JsonRpcId
  ): Promise<responses.ValidatorsResponse> {
    const validators: responses.Validator[] = [];
    let page = 1;
    let done = false;
    let blockHeight = height;

    while (!done) {
      const response = await this.validators({
        per_page: 50,
        height: blockHeight,
        page: page
      }, id);
      validators.push(...response.validators);
      blockHeight = blockHeight || response.blockHeight;
      if (validators.length < response.total) {
        page++;
      } else {
        done = true;
      }
    }

    return {
      // NOTE: Default value is for type safety but this should always be set
      blockHeight: blockHeight ?? 0,
      count: validators.length,
      total: validators.length,
      validators: validators
    };
  }

  // addCall is a helper to handle the encode/call/decode logic
  private async addCall<T extends requests.Request,
    U extends responses.Response>(request: T, encode: Encoder<T>, decode: Decoder<U>, id?: JsonRpcId): Promise<U> {
    const req = encode(request);
    if (id) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      req['id'] = id;
    }
    this.batchRequests.push(req);
    this.batchDecoders.push(decode);
    return;
  }

  private subscribe<T>(
    request: requests.SubscribeRequest,
    decode: (e: SubscriptionEvent) => T
  ): Stream<T> {
    if (!instanceOfRpcStreamingClient(this.client)) {
      throw new Error('This RPC client type cannot subscribe to events');
    }

    const req = this.p.encodeSubscribe(request);
    const eventStream = this.client.listen(req);
    return eventStream.map<T>((event) => {
      return decode(event);
    });
  }

  public async queryVerified(
    store: string,
    key: Uint8Array,
    desiredHeight?: number
  ): Promise<Uint8Array> {
    const { height, proof, value } = await this.queryRawProof(
      store,
      key,
      desiredHeight
    );

    const subProof = checkAndParseOp(proof.ops[0], 'ics23:iavl', key);
    const storeProof = checkAndParseOp(
      proof.ops[1],
      'ics23:simple',
      toAscii(store)
    );

    // this must always be existence, if the store is not a typo
    assert(storeProof.exist);
    assert(storeProof.exist.value);

    // this may be exist or non-exist, depends on response
    if (!value || value.length === 0) {
      // non-existence check
      assert(subProof.nonexist);
      // the subproof must map the desired key to the "value" of the storeProof
      verifyNonExistence(
        subProof.nonexist,
        iavlSpec,
        storeProof.exist.value,
        key
      );
    } else {
      // existence check
      assert(subProof.exist);
      assert(subProof.exist.value);
      // the subproof must map the desired key to the "value" of the storeProof
      verifyExistence(
        subProof.exist,
        iavlSpec,
        storeProof.exist.value,
        key,
        value
      );
    }

    // the store proof must map its declared value (root of subProof) to the appHash of the next block
    const header = await this.getNextHeader(height);
    verifyExistence(
      storeProof.exist,
      tendermintSpec,
      header.appHash,
      toAscii(store),
      storeProof.exist.value
    );

    return value;
  }

  public async queryRawProof(
    store: string,
    queryKey: Uint8Array,
    desiredHeight?: number
  ): Promise<ProvenQuery> {
    const { key, value, height, proof, code, log } = await this.abciQuery({
      // we need the StoreKey for the module, not the module name
      // https://github.com/cosmos/cosmos-sdk/blob/8cab43c8120fec5200c3459cbf4a92017bb6f287/x/auth/types/keys.go#L12
      path: `/store/${store}/key`,
      data: queryKey,
      prove: true,
      height: desiredHeight
    });

    if (code) {
      throw new Error(`Query failed with (${code}): ${log}`);
    }

    if (!arrayContentEquals(queryKey, key)) {
      throw new Error(
        `Response key ${toHex(key)} doesn't match query key ${toHex(queryKey)}`
      );
    }

    if (!height) {
      throw new Error('No query height returned');
    }
    if (!proof || proof.ops.length !== 2) {
      throw new Error(
        `Expected 2 proof ops, got ${
          proof?.ops.length ?? 0
        }. Are you using stargate?`
      );
    }

    // we don't need the results, but we can ensure the data is the proper format
    checkAndParseOp(proof.ops[0], 'ics23:iavl', key);
    checkAndParseOp(proof.ops[1], 'ics23:simple', toAscii(store));

    return {
      key: key,
      value: value,
      height: height,
      // need to clone this: readonly input / writeable output
      proof: {
        ops: [...proof.ops]
      }
    };
  }

  public async queryUnverified(
    path: string,
    request: Uint8Array,
    desiredHeight?: number,
    id?: JsonRpcId
  ): Promise<Uint8Array> {
    const response = await this.abciQuery({
      path: path,
      data: request,
      prove: false,
      height: desiredHeight
    }, id);

    // if (response.code) {
    //   throw new Error(`Query failed with (${response.code}): ${response.log}`);
    // }
    // return response.value;
    const f = new Uint8Array([]);
    return new Promise((resolve) => resolve(f));


  }

  // this must return the header for height+1
  // throws an error if height is 0 or undefined
  private async getNextHeader(height?: number): Promise<tendermint34.Header> {
    assertDefined(height);
    if (height === 0) {
      throw new Error('Query returned height 0, cannot prove it');
    }

    const searchHeight = height + 1;
    let nextHeader: tendermint34.Header | undefined;
    let headersSubscription:
      | Stream<tendermint34.NewBlockHeaderEvent>
      | undefined;
    try {
      headersSubscription = this.subscribeNewBlockHeader();
    } catch {
      // Ignore exception caused by non-WebSocket Tendermint clients
    }

    if (headersSubscription) {
      const firstHeader = await firstEvent(headersSubscription);
      // The first header we get might not be n+1 but n+2 or even higher. In such cases we fall back on a query.
      if (firstHeader.height === searchHeight) {
        nextHeader = firstHeader;
      }
    }

    while (!nextHeader) {
      // start from current height to avoid backend error for minHeight in the future
      const correctHeader = (
        await this.blockchain(height, searchHeight)
      ).blockMetas
        .map((meta) => meta.header)
        .find((h) => h.height === searchHeight);
      if (correctHeader) {
        nextHeader = correctHeader;
      } else {
        await sleep(1000);
      }
    }

    assert(
      nextHeader.height === searchHeight,
      'Got wrong header. This is a bug in the logic above.'
    );
    return nextHeader;
  }

  public async doCallBatch() {
    const responses = await this.client.executeBatch(this.batchRequests);
    if (this.batchRequests.length == 0) return {};
    const decodedResponses = {};
    for (let i = 0; i < this.batchRequests.length; i++) {
      const decoder = this.batchDecoders[i];
      decodedResponses[responses[i].id] = decoder(responses[i]);
    }
    this.batchRequests = [];
    this.batchDecoders = [];
    return decodedResponses;
  }

  public getBatchRequests() {
    return this.batchRequests;
  }
}
