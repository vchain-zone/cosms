import { MsgClientImpl } from 'cosmjs-types/cosmos/crisis/v1beta1/tx';
import { provider } from '../providers';

import { App } from './app';

export class Crisis extends App {
  public declare message: MsgClientImpl;

  constructor(provider: provider) {
    super(provider);
    this.setMessage(MsgClientImpl);
  }
}
