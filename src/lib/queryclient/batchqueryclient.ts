import { JsonRpcId } from '@cosmjs/json-rpc/build/types';
import {
  AuthExtension,
  BankExtension,
  StakingExtension,
  StargateClientOptions,
  TxExtension
} from '@cosmjs/stargate';
import {
  ProvenQuery,
  QueryClient
} from '@cosmjs/stargate/build/queryclient/queryclient';
import { StargateClient } from '@cosmjs/stargate/build/stargateclient';
import { HttpEndpoint, Tendermint34Client } from '@cosmjs/tendermint-rpc';

import {
  TendermintBatchClient
} from '../tendermint-batch-rpc/tendermintbatchclient';

export class BatchQueryClient extends StargateClient {
  get tmBatchClient(): TendermintBatchClient {
    return this._tmBatchClient;
  }

  private readonly _tmBatchClient: TendermintBatchClient;

  protected constructor(
    tmClient: TendermintBatchClient | undefined,
    tm34Client: Tendermint34Client | undefined,
    options: StargateClientOptions
  ) {
    super(tm34Client, options);
    this._tmBatchClient = tmClient;
  }

  static async connect(
    endpoint: string | HttpEndpoint,
    options: StargateClientOptions = {}
  ): Promise<BatchQueryClient> {
    const tmClient = await Tendermint34Client.connect(endpoint);
    const tmBatchClient = await TendermintBatchClient.connect(endpoint);
    return new BatchQueryClient(tmBatchClient, tmClient, options);
  }

  getQueryClient():
    | (QueryClient &
    AuthExtension &
    BankExtension &
    StakingExtension &
    TxExtension)
    | undefined {
    return super.getQueryClient();
  }

  public async queryVerified(
    store: string,
    key: Uint8Array,
    desiredHeight?: number
  ): Promise<Uint8Array> {
    return this._tmBatchClient.queryVerified(store, key, desiredHeight);
  }

  public async queryRawProof(
    store: string,
    queryKey: Uint8Array,
    desiredHeight?: number
  ): Promise<ProvenQuery> {
    return this._tmBatchClient.queryRawProof(store, queryKey, desiredHeight);
  }

  public async queryUnverified(
    path: string,
    request: Uint8Array,
    desiredHeight?: number,
    id?: JsonRpcId
  ): Promise<Uint8Array> {
    return this._tmBatchClient.queryUnverified(path, request, desiredHeight, id);
  }
}
