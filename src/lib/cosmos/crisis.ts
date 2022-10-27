import * as MsgClient from 'cosmjs-types/cosmos/crisis/v1beta1/tx';
import { MsgClientImpl } from 'cosmjs-types/cosmos/crisis/v1beta1/tx';

import { Provider } from '../providers';

import { App } from './app';

export class Crisis extends App {
  public declare message: MsgClientImpl;

  constructor(provider: Provider) {
    super(provider);
    this.setMessage(MsgClient);
  }
}
