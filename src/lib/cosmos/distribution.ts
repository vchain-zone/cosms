import * as Protobuf
  from 'cosmjs-types/cosmos/distribution/v1beta1/distribution';
import {
  QueryClientImpl
} from 'cosmjs-types/cosmos/distribution/v1beta1/query';
import * as QueryClient from 'cosmjs-types/cosmos/distribution/v1beta1/tx';
import { MsgClientImpl } from 'cosmjs-types/cosmos/distribution/v1beta1/tx';

import { Provider } from '../providers';

import { App } from './app';

export class Distribution extends App {
  public declare query: MsgClientImpl;
  public protobuf = Protobuf;

  constructor(provider: Provider) {
    super(provider);
    this.setQueryClient(QueryClientImpl);
    this.setMessage(QueryClient);
  }
}
