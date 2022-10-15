import { BatchQueryClient } from '../queryclient/batchqueryclient';
import { TendermintBatchClient } from '../tendermint-batch-rpc/tendermintbatchclient';

export class BaseProvider {
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

  /**
   *
   */
  constructor() {}

  async connect(rpcUrl: string) {
    this._rpcUrl = rpcUrl;
    this._tendermintClient = await TendermintBatchClient.connect(rpcUrl);
    this._batchQueryClient = await BatchQueryClient.connect(rpcUrl);
    this._chainID = await this._batchQueryClient.getChainId();

    return this;
  }
}
