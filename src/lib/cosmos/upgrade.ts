import { QueryClientImpl } from 'cosmjs-types/cosmos/upgrade/v1beta1/query';
import * as Protobuf from 'cosmjs-types/cosmos/upgrade/v1beta1/upgrade';


import { provider } from '../providers';

import { App } from './app';

export class Upgrade extends App {

  public query: QueryClientImpl;
  public protobuf = Protobuf;

  constructor(provider: provider) {
    super(provider);
    this.setQueryClient(QueryClientImpl);
  }

}
