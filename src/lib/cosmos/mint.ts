import * as Protobuf from 'cosmjs-types/cosmos/mint/v1beta1/mint';
import { QueryClientImpl } from 'cosmjs-types/cosmos/mint/v1beta1/query';

import { provider } from '../providers';

import { App } from './app';

export class Mint extends App {
  public declare query: QueryClientImpl;
  public protobuf = Protobuf;

  constructor(provider: provider) {
    super(provider);
    this.setQueryClient(QueryClientImpl);
  }
}
