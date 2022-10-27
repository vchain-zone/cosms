import * as Protobuf from 'cosmjs-types/cosmos/capability/v1beta1/capability';

import { Provider } from '../providers';

import { App } from './app';

export class Capability extends App {
  public protobuf = Protobuf;

  constructor(provider: Provider) {
    super(provider);
  }
}
