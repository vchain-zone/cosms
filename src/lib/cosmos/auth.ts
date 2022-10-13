import * as Protobuf from 'cosmjs-types/cosmos/auth/v1beta1/auth';
import { QueryClientImpl } from 'cosmjs-types/cosmos/auth/v1beta1/query';

import { provider } from '../providers';

import { App } from './app';

export class Auth extends App {
  public declare query: QueryClientImpl;
  public protobuf = Protobuf;

  constructor(provider: provider) {
    super(provider);
    this.setQueryClient(QueryClientImpl);
  }
}
