import * as Protobuf from 'cosmjs-types/cosmos/feegrant/v1beta1/feegrant';
import { QueryClientImpl } from 'cosmjs-types/cosmos/feegrant/v1beta1/query';
import { MsgClientImpl } from 'cosmjs-types/cosmos/feegrant/v1beta1/tx';

import { provider } from '../providers';

import { App } from './app';

export class FeeGrant extends App {
  public declare query: QueryClientImpl;
  public protobuf = Protobuf;

  constructor(provider: provider) {
    super(provider);
    this.setQueryClient(QueryClientImpl);
    this.setMessage(MsgClientImpl);
  }
}
