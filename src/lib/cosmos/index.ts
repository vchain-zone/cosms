import { version } from '../cosm/version';
import { provider } from '../providers';
import { App } from './app';
import { Auth } from './auth';
import { Authz } from './authz';
import { Bank } from './bank';
import { Base } from './base';
import { Capability } from './capability';
import { Crisis } from './crisis';
import { Crypto } from './crypto';
import { Distribution } from './distribution';
import { Evidence } from './evidence';
import { FeeGrant } from './feegrant';
import { Genutil } from './genutil';
import { Gov } from './gov';
import { Mint } from './mint';
import { Params } from './params';
import { Slashing } from './slashing';
import { Staking } from './staking';
import { Tx } from './tx';
import { Upgrade } from './upgrade';
import { Vesting } from './vesting';

export default class Cosmos {
  private _provider: provider;
  public version: string;

  public app: App;
  public auth: Auth;
  public authz: Authz;
  public bank: Bank;
  public base: Base;
  public capability: Capability;
  public crisis: Crisis;
  public crypto: Crypto;
  public distribution: Distribution;
  public evidence: Evidence;
  public feegrant: FeeGrant;
  public genutil: Genutil;
  public gov: Gov;
  public mint: Mint;
  public params: Params;
  public slashing: Slashing;
  public staking: Staking;
  public tx: Tx;
  public upgrade: Upgrade;
  public vesting: Vesting;

  constructor(provider: provider) {
    this._provider = provider;
    this.app = new App(provider);
    this.auth = new Auth(provider);
    this.authz = new Authz(provider);
    this.bank = new Bank(provider);
    this.base = new Base(provider);
    this.capability = new Capability(provider);
    this.crisis = new Crisis(provider);
    this.crypto = new Crypto(provider);
    this.distribution = new Distribution(provider);
    this.evidence = new Evidence(provider);
    this.feegrant = new FeeGrant(provider);
    this.genutil = new Genutil(provider);
    this.gov = new Gov(provider);
    this.mint = new Mint(provider);
    this.params = new Params(provider);
    this.slashing = new Slashing(provider);
    this.staking = new Staking(provider);
    this.tx = new Tx(provider);
    this.upgrade = new Upgrade(provider);
    this.vesting = new Vesting(provider);
    this.version = version;
  }
}
