import {
  SigningCosmWasmClient,
  SigningCosmWasmClientOptions
} from '@cosmjs/cosmwasm-stargate';
import {
  DirectSecp256k1HdWallet,
  makeCosmoshubPath,
  OfflineSigner
} from '@cosmjs/proto-signing';
import { AccountData } from '@cosmjs/proto-signing/build/signer';
import {
  SigningStargateClient,
  SigningStargateClientOptions
} from '@cosmjs/stargate';

import { provider } from '../providers';


export default OfflineSigner;

export interface WalletOptions {
  readonly cosmWasmOptions: SigningCosmWasmClientOptions;
  readonly stargateOptions: SigningStargateClientOptions;
}

export class Wallet {
  private _signer: DirectSecp256k1HdWallet;
  private _cosmWasmSigner: SigningCosmWasmClient;
  private _stargateSigner: SigningStargateClient;
  private _account: AccountData;

  public static async getSigner(
    provider: provider,
    mnemonic: string,
    prefix: string,
    options?: WalletOptions
  ): Promise<Wallet> {
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      hdPaths: [makeCosmoshubPath(0)],
      prefix: prefix
    });
    const cosmWasmClient = await SigningCosmWasmClient.connectWithSigner(
      provider.rpcUrl,
      wallet,
      options.cosmWasmOptions
    );
    const stargateClient = await SigningStargateClient.connectWithSigner(
      provider.rpcUrl,
      wallet,
      options.stargateOptions
    );
    const [account] = await wallet.getAccounts();
    return new Wallet(wallet, account, cosmWasmClient, stargateClient);
  }

  public static async getSigners(
    provider: provider,
    mnemonic: string,
    prefix: string,
    amount: number,
    options?: WalletOptions
  ): Promise<Wallet[]> {
    const wallets = [];
    if (amount <= 0) {
      throw 'Amount must be greater than zero';
    }
    for (let i = 0; i < amount; i++) {
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
        hdPaths: [makeCosmoshubPath(i)],
        prefix: prefix
      });
      const cosmWasmClient = await SigningCosmWasmClient.connectWithSigner(
        provider.rpcUrl,
        wallet,
        options.cosmWasmOptions
      );
      const stargateClient = await SigningStargateClient.connectWithSigner(
        provider.rpcUrl,
        wallet,
        options.stargateOptions
      );
      const [account] = await wallet.getAccounts();
      wallets.push(new Wallet(wallet, account, cosmWasmClient, stargateClient));
    }
    return wallets;
  }

  private constructor(
    wallet: DirectSecp256k1HdWallet,
    account: AccountData,
    cosmWasmSigner: SigningCosmWasmClient,
    stargateSigner: SigningStargateClient
  ) {
    this._signer = wallet;
    this._account = account;
    this._cosmWasmSigner = cosmWasmSigner;
    this._stargateSigner = stargateSigner;
  }

  get address(): string {
    return this._account.address;
  }
}
