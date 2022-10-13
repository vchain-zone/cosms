import { OfflineSigner } from '@cosmjs/proto-signing';
import { SigningStargateClientOptions } from '@cosmjs/stargate/build/signingstargateclient';
import Cosmos from '../cosmos';
import { provider } from '../providers';
import { Utils } from '../utils';
import { Wallet } from '../wallet';
import { Wasm } from '../wasm';

import { version } from './version';

export default class Cosm {
  get wallet(): Wallet {
    if (!this._wallet) {
      throw 'Must call Cosm.setSigner(offlineSigner: OfflineSigner, options?: SigningStargateClientOptions) or Cosm.setWallet(wallet: Wallet) before using wallet';
    }
    return this._wallet;
  }

  private offlineSinger: OfflineSigner;
  private _wallet: Wallet;

  get provider(): provider {
    return this._provider;
  }

  private _provider: provider;
  utils: Utils;
  cosmos: Cosmos;
  wasm: Wasm;

  constructor(provider: provider) {
    this._provider = provider;
    this.cosmos = new Cosmos(provider);
    this.wasm = new Wasm(provider);
    this.utils = new Utils();
  }

  async setSigner(
    offlineSigner: OfflineSigner,
    options?: SigningStargateClientOptions
  ) {
    this.offlineSinger = offlineSigner;
    this._wallet = await Wallet.connectWithSigner(
      this._provider.rpcUrl,
      offlineSigner,
      options
    );
  }

  async setWallet(wallet: Wallet) {
    this._wallet = wallet;
  }

  static readonly version: string = version;
}
