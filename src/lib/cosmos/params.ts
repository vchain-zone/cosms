import * as Protobuf from 'cosmjs-types/cosmos/params/v1beta1/params';
import { QueryClientImpl } from 'cosmjs-types/cosmos/params/v1beta1/query';

import { Provider } from '../providers';

import { App } from './app';

export class Params extends App {
  public declare query: QueryClientImpl;
  public protobuf = Protobuf;

  constructor(provider: Provider) {
    super(provider);
    this.setQueryClient(QueryClientImpl);
  }
}
