import * as Protobuf from 'cosmjs-types/cosmos/evidence/v1beta1/evidence';
import { QueryClientImpl } from 'cosmjs-types/cosmos/evidence/v1beta1/query';
import { MsgClientImpl } from 'cosmjs-types/cosmos/evidence/v1beta1/tx';

import { provider } from '../providers';

import { App } from './app';

export class Evidence extends App {
  public declare query: QueryClientImpl;
  public declare message: MsgClientImpl;
  public protobuf = Protobuf;

  constructor(provider: provider) {
    super(provider);
    this.setQueryClient(QueryClientImpl);
    this.setMessage(MsgClientImpl);
  }
}
