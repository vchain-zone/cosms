import * as Protobuf from 'cosmjs-types/cosmos/gov/v1beta1/gov';
import { QueryClientImpl } from 'cosmjs-types/cosmos/gov/v1beta1/query';

import { provider } from '../providers';

import { App } from './app';

export class Gov extends App {
  public declare query: QueryClientImpl;
  public protobuf = Protobuf;

  constructor(provider: provider) {
    super(provider);
    this.setQueryClient(QueryClientImpl);
  }
}
