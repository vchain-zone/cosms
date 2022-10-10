import { version } from '../cosm/version';
import { provider } from '../providers';
import { Staking } from './staking';

export default class Cosmos {
  get staking(): Staking {
    return this._staking;
  }

  private _provider: provider;
  public version: string;
  private _staking: Staking;

  constructor(provider: provider) {
    this._provider = provider;
    this._staking = new Staking(provider);
    this.version = version;
  }
}
