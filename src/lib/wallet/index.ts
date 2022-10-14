import {
  SigningCosmWasmClient,
  SigningCosmWasmClientOptions,
  UploadResult,
} from '@cosmjs/cosmwasm-stargate';
import {
  DirectSecp256k1HdWallet,
  makeCosmoshubPath,
  OfflineSigner,
} from '@cosmjs/proto-signing';
import { AccountData } from '@cosmjs/proto-signing/build/signer';
import {
  calculateFee,
  GasPrice,
  SigningStargateClient,
  SigningStargateClientOptions,
  StdFee,
} from '@cosmjs/stargate';

import Cosm from '../cosm';
import { provider } from '../providers';

const defaultUploadGas = 2500000;
const defaultInitGas = 1000000;
const defaultExecGas = 500000;
const defaultGasPrice = 0.25;

export default OfflineSigner;

export interface WalletOptions {
  readonly cosmWasmOptions: SigningCosmWasmClientOptions;
  readonly stargateOptions: SigningStargateClientOptions;
}

export class Wallet {
  private _signer: OfflineSigner;
  private _cosmWasmSigner: SigningCosmWasmClient;
  private _stargateSigner: SigningStargateClient;
  private _account: AccountData;
  private _denom: string;

  public static async getWalletFromMnemonic(
    provider: provider,
    mnemonic: string,
    prefix: string,
    options?: WalletOptions
  ): Promise<Wallet> {
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      hdPaths: [makeCosmoshubPath(0)],
      prefix: prefix,
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
    return new Wallet(
      wallet,
      account,
      cosmWasmClient,
      stargateClient,
      await getDenom(provider)
    );
  }

  public static async getWalletsFromMnemonic(
    provider: provider,
    mnemonic: string,
    prefix: string,
    amount: number,
    options?: WalletOptions
  ): Promise<Wallet[]> {
    const paths = [];
    if (amount <= 1) {
      throw 'Amount must be greater than one';
    }
    for (let i = 0; i < amount; i++) {
      paths.push(makeCosmoshubPath(i));
    }
    const wallets = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      hdPaths: paths,
      prefix: prefix,
    });
    const accounts = await wallets.getAccounts();
    const results = [];
    for (let i = 0; i < accounts.length; i++) {
      const cosmWasmClient = await SigningCosmWasmClient.connectWithSigner(
        provider.rpcUrl,
        wallets,
        options.cosmWasmOptions
      );
      const stargateClient = await SigningStargateClient.connectWithSigner(
        provider.rpcUrl,
        wallets,
        options.stargateOptions
      );
      results.push(
        new Wallet(
          wallets,
          accounts[i],
          cosmWasmClient,
          stargateClient,
          await getDenom(provider)
        )
      );
    }
    return results;
  }

  public static async getWalletsFromOfflineSigner(
    provider: provider,
    signer: OfflineSigner,
    prefix: string,
    options?: WalletOptions
  ): Promise<Wallet[]> {
    const results = [];
    const accounts = await signer.getAccounts();
    for (let i = 0; i < accounts.length; i++) {
      const cosmWasmClient = await SigningCosmWasmClient.connectWithSigner(
        provider.rpcUrl,
        signer,
        options.cosmWasmOptions
      );
      const stargateClient = await SigningStargateClient.connectWithSigner(
        provider.rpcUrl,
        signer,
        options.stargateOptions
      );
      results.push(
        new Wallet(
          signer,
          accounts[i],
          cosmWasmClient,
          stargateClient,
          await getDenom(provider)
        )
      );
    }
    return results;
  }

  private constructor(
    signer: OfflineSigner,
    account: AccountData,
    cosmWasmSigner: SigningCosmWasmClient,
    stargateSigner: SigningStargateClient,
    denom: string
  ) {
    this._signer = signer;
    this._account = account;
    this._cosmWasmSigner = cosmWasmSigner;
    this._stargateSigner = stargateSigner;
    this._denom = denom;
  }

  public async uploadWasm(wasmCode: Uint8Array, fee?: StdFee, memo?: string): Promise<UploadResult> {
    fee = fee == null ? this.getFee(defaultUploadGas, defaultGasPrice) : fee;
    return await this._cosmWasmSigner.upload(this.address, wasmCode, fee, memo);
  }

  public async deloyContractFromCodeId(codeId: number){

  }

  public getFee(gas: number, gasPrice: number): StdFee {
    return calculateFee(
      gas,
      GasPrice.fromString(gasPrice.toString() + this._denom)
    );
  }

  get address(): string {
    return this._account.address;
  }

  get denom(): string {
    return this._denom;
  }
}

async function getDenom(provider: provider): Promise<string> {
  const cosm = new Cosm(provider);
  const queryRs = await cosm.cosmos.mint.query.Params({});
  return queryRs.params.mintDenom;
}
