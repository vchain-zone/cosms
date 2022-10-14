import { MsgClientImpl } from 'cosmjs-types/cosmos/vesting/v1beta1/tx';
import * as Protobuf from 'cosmjs-types/cosmos/vesting/v1beta1/vesting';

import { Provider } from '../providers';

import { App } from './app';

export class Vesting extends App {
  public protobuf = Protobuf;
  public declare message: MsgClientImpl;

  constructor(provider: Provider) {
    super(provider);
    this.setMessage(MsgClientImpl);
  }
}
