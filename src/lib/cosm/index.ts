import Cosmos from '../cosmos';
import { provider } from '../providers';
import { Utils } from '../utils';
import { Wasm } from '../wasm';

import { version } from './version';

export default class Cosm {
  get provider(): provider {
    return this._provider;
  }

  private _provider: provider;

  constructor(provider: provider) {
    this._provider = provider;
    this.cosmos = new Cosmos(provider);
    this.wasm = new Wasm(provider);
    this.utils = new Utils();
  }

  utils: Utils;
  cosmos: Cosmos;
  wasm: Wasm;
  static readonly version: string = version;
}
