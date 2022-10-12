import * as Protobuf from 'cosmjs-types/cosmos/authz/v1beta1/authz';
import { QueryClientImpl } from 'cosmjs-types/cosmos/authz/v1beta1/query';


import { provider } from '../providers';

import { App } from './app';

export class Authz extends App {

  public query: QueryClientImpl;
  public protobuf = Protobuf;

  constructor(provider: provider) {
    super(provider);
    this.setQueryClient(QueryClientImpl);
  }

}
