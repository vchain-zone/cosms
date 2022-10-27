import * as Protobuf from 'cosmjs-types/cosmos/feegrant/v1beta1/feegrant';
import { QueryClientImpl } from 'cosmjs-types/cosmos/feegrant/v1beta1/query';
import * as MsgClient from 'cosmjs-types/cosmos/feegrant/v1beta1/tx';

import { Provider } from '../providers';

import { App } from './app';

export class FeeGrant extends App {
  public declare query: QueryClientImpl;
  public protobuf = Protobuf;

  constructor(provider: Provider) {
    super(provider);
    this.setQueryClient(QueryClientImpl);
    this.setMessage(MsgClient);
  }
}
