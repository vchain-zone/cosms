import { QueryClientImpl } from 'cosmjs-types/cosmos/upgrade/v1beta1/query';
import * as Protobuf from 'cosmjs-types/cosmos/upgrade/v1beta1/upgrade';

import { Provider } from '../providers';

import { App } from './app';

export class Upgrade extends App {
  public declare query: QueryClientImpl;
  public protobuf = Protobuf;

  constructor(provider: Provider) {
    super(provider);
    this.setQueryClient(QueryClientImpl);
  }
}
