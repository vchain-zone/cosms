import * as Protobuf from 'cosmjs-types/cosmos/authz/v1beta1/authz';
import { QueryClientImpl } from 'cosmjs-types/cosmos/authz/v1beta1/query';
import * as MsgClient from 'cosmjs-types/cosmos/authz/v1beta1/tx';
import { MsgClientImpl } from 'cosmjs-types/cosmos/authz/v1beta1/tx';

import { Provider } from '../providers';
import { ProtobufRpcBatchClient } from '../queryclient/ProtobufRpcBatchClient';
import { ProtobufRpcStateClient } from '../queryclient/ProtobufRpcStateClient';

import { App } from './app';

export class Authz extends App {
  public declare query: QueryClientImpl & ProtobufRpcStateClient;
  public declare queryBatch: QueryClientImpl & ProtobufRpcBatchClient;
  public declare message: MsgClientImpl;
  public protobuf = Protobuf;

  constructor(provider: Provider) {
    super(provider);
    this.setQueryClient(QueryClientImpl);
    this.setMessage(MsgClient);
  }
}
