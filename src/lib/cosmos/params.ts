import * as Protobuf from 'cosmjs-types/cosmos/params/v1beta1/params';
import { QueryClientImpl } from 'cosmjs-types/cosmos/params/v1beta1/query';

import { Provider } from '../providers';
import { ProtobufRpcBatchClient } from '../queryclient/ProtobufRpcBatchClient';
import { ProtobufRpcStateClient } from '../queryclient/ProtobufRpcStateClient';

import { App } from './app';

export class Params extends App {
  public declare query: QueryClientImpl & ProtobufRpcStateClient;
  public declare queryBatch: QueryClientImpl & ProtobufRpcBatchClient;
  public protobuf = Protobuf;

  constructor(provider: Provider) {
    super(provider);
    this.setQueryClient(QueryClientImpl);
  }
}
