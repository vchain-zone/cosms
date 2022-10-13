import { OfflineSigner } from '@cosmjs/proto-signing';
import { AccountData } from '@cosmjs/proto-signing/build/signer';
import {
  SigningStargateClient,
  SigningStargateClientOptions,
} from '@cosmjs/stargate';
import { Tendermint34Client } from '@cosmjs/tendermint-rpc';
import { HttpEndpoint } from '@cosmjs/tendermint-rpc/build/rpcclients';

import { TendermintBatchClient } from '../tendermint-rpc/tendermintbatchclient';

export default OfflineSigner;

export class Wallet extends SigningStargateClient {
  _signer: OfflineSigner;
  _tendermintBatchClient: TendermintBatchClient;
  _tendermintClient: Tendermint34Client;
  private _accounts: readonly AccountData[];

  public static async connectWithSigner(
    endpoint: string | HttpEndpoint,
    signer: OfflineSigner,
    options: SigningStargateClientOptions = {}
  ): Promise<Wallet> {
    const tmClient = await Tendermint34Client.connect(endpoint);
    const tmBatchClient = await TendermintBatchClient.connect(endpoint);
    return new Wallet(tmClient, signer, options, tmBatchClient);
  }

  private constructor(tmClient, signer, options, tmBatchClient) {
    super(tmClient, signer, options);
    this._tendermintClient = tmClient;
    this._tendermintBatchClient = tmBatchClient;
    this._signer = signer;
  }

  async getAccounts() {
    if (!this._accounts) {
      this._accounts = await this._signer.getAccounts();
    }
    return this._accounts;
  }

  async getAddresses() {
    const accounts = await this.getAccounts();
    const listAddresses = [];
    for (const account of accounts) {
      listAddresses.push(account);
    }
    return listAddresses;
  }

  async getDefaultAddress() {
    const listAddress = await this.getAddresses();
    return listAddress[0];
  }
}
