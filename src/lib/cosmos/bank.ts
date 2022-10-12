import * as Protobuf from 'cosmjs-types/cosmos/bank/v1beta1/bank';
import { QueryClientImpl } from 'cosmjs-types/cosmos/bank/v1beta1/query';


import { provider } from '../providers';

import { App } from './app';

export class Bank extends App {

  public query: QueryClientImpl;
  public protobuf = Protobuf;

  constructor(provider: provider) {
    super(provider);
    this.setQueryClient(QueryClientImpl);
  }

}
