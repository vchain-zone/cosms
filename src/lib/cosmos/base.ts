import * as Protobuf from 'cosmjs-types/cosmos/base/v1beta1/coin';

import { provider } from '../providers';

import { App } from './app';

export class Base extends App {
  public protobuf = Protobuf;

  constructor(provider: provider) {
    super(provider);
  }
}
