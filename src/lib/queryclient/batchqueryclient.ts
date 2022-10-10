import {
  AuthExtension,
  BankExtension,
  QueryClient,
  StakingExtension,
  StargateClientOptions,
  TxExtension,
} from '@cosmjs/stargate';
import { StargateClient } from '@cosmjs/stargate/build/stargateclient';
import { HttpEndpoint, Tendermint34Client } from '@cosmjs/tendermint-rpc';

import { TendermintBatchClient } from '../tendermint-rpc/tendermintbatchclient';

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
}
