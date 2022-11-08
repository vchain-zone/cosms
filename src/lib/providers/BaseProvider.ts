/* eslint-disable @typescript-eslint/adjacent-overload-signatures */
import { BatchQueryClient } from '../queryclient/batchqueryclient';
import {
  createProtobufRpcBatchClient,
  ProtobufRpcBatchClient
} from '../queryclient/ProtobufRpcBatchClient';
import {
  TendermintBatchClient
} from '../tendermint-batch-rpc/tendermintbatchclient';

export class BaseProvider {
  public batchClient: ProtobufRpcBatchClient;

  get batchQueryClient(): BatchQueryClient {
    return this._batchQueryClient;
  }

  private _batchQueryClient: BatchQueryClient;
  private _chainID: string;

  get tendermintClient(): TendermintBatchClient {
    return this._tendermintClient;
  }

  get rpcUrl(): string {
    return this._rpcUrl;
  }

  private _tendermintClient: TendermintBatchClient;
  private _rpcUrl: string;

  private _bech32Prefix: string;
  private _feeToken: string;

  get bech32Prefix(): string {
    return this._bech32Prefix;
  }

  get feeToken(): string {
    return this._feeToken;
  }

  set bech32Prefix(bech32Prefix: string) {
    this._bech32Prefix = bech32Prefix;
  }

  set feeToken(feeToken: string) {
    this._feeToken = feeToken;
  }


  /**
   *
   */
  constructor() {
  }

  async connect(rpcUrl: string, bech32Prefix?: string, feeToken?: string) {
    this._rpcUrl = rpcUrl;
    this._tendermintClient = await TendermintBatchClient.connect(rpcUrl);
    this._batchQueryClient = await BatchQueryClient.connect(rpcUrl);
    this._chainID = await this._batchQueryClient.getChainId();
    this._bech32Prefix = bech32Prefix;
    this._feeToken = feeToken;

    this.batchClient = createProtobufRpcBatchClient(this.batchQueryClient);
    return this;
  }

  getBatchRequest() {
    return this.batchQueryClient.tmBatchClient.getBatchRequests();
  }

  async doCallBatch() {
    return this.batchQueryClient.tmBatchClient.doCallBatch();
  }

  static async fromRpcUrl(rpcUrl: string, bech32Prefix?: string, feeToken?: string): Promise<BaseProvider> {
    const instance = new BaseProvider();
    return instance.connect(rpcUrl, bech32Prefix, feeToken);
  }
}
