import { OfflineSigner } from '@cosmjs/proto-signing';

import APRCalCulator from '../apr';
import Cosmos from '../cosmos';
import { Provider } from '../providers';
import {
  TendermintBatchClient
} from '../tendermint-batch-rpc/tendermintbatchclient';
import { Utils } from '../utils';
import { Wallet } from '../wallet';
import { StaticWasm, Wasm } from '../wasm';

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

  get provider(): Provider {
    return this._provider;
  }

  private _provider: Provider;
  static utils = Utils;
  cosmos: Cosmos;
  wasm: Wasm | StaticWasm;
  tendermint: TendermintBatchClient;

  calculator: APRCalCulator;

  constructor(provider: Provider) {
    this._provider = provider;
    this.cosmos = new Cosmos(provider);
    // this.wasm = new Wasm(provider);;
    this.wasm = Wasm.connect(provider);
    this.tendermint = provider.tendermintClient;
    // this.utils = new Utils();
    this.calculator = new APRCalCulator(this.cosmos, provider);
  }

  async setWallet(wallet: Wallet) {
    this._wallet = wallet;
    this.cosmos.setWallet(wallet);
    this.wasm = new Wasm(wallet);
  }

  static readonly version: string = version;
}
