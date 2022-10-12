import * as Protobuf from 'cosmjs-types/cosmos/vesting/v1beta1/vesting';


import { provider } from '../providers';

import { App } from './app';

export class Vesting extends App {
  public protobuf = Protobuf;

  constructor(provider: provider) {
    super(provider);
  }

}
