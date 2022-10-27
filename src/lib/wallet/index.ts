import {
    SigningCosmWasmClient,
    SigningCosmWasmClientOptions,
} from '@cosmjs/cosmwasm-stargate';
import {
    Coin,
    DirectSecp256k1HdWallet,
    makeCosmoshubPath,
    OfflineSigner,
} from '@cosmjs/proto-signing';
import { AccountData } from '@cosmjs/proto-signing/build/signer';
import {
    SigningStargateClient,
    SigningStargateClientOptions,
} from '@cosmjs/stargate';

import { Provider } from '../providers';

export interface WalletOptions {
    readonly cosmWasmOptions?: SigningCosmWasmClientOptions;
    readonly stargateOptions?: SigningStargateClientOptions;
}

export class Wallet {
    private _signer: OfflineSigner;
    private _cosmWasmSigner: SigningCosmWasmClient;
    private _stargateSigner: SigningStargateClient;
    private _provider: Provider;
    private _account: AccountData;

    public static async getWalletFromMnemonic(
        provider: Provider,
        mnemonic: string,
        options?: WalletOptions
    ): Promise<Wallet> {
        checkProvider(provider);
        const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
            hdPaths: [makeCosmoshubPath(0)],
            prefix: provider.bech32Prefix,
        });
        let cosmWasmClient: SigningCosmWasmClient;
        let stargateClient: SigningStargateClient;
        if (options != undefined) {
            cosmWasmClient = await SigningCosmWasmClient.connectWithSigner(
                provider.rpcUrl,
                wallet,
                options.cosmWasmOptions
            );
            stargateClient = await SigningStargateClient.connectWithSigner(
                provider.rpcUrl,
                wallet,
                options.stargateOptions
            );
        } else {
            cosmWasmClient = await SigningCosmWasmClient.connectWithSigner(
                provider.rpcUrl,
                wallet
            );
            stargateClient = await SigningStargateClient.connectWithSigner(
                provider.rpcUrl,
                wallet
            );
        }
        const [account] = await wallet.getAccounts();
        return new Wallet(provider, wallet, account, cosmWasmClient, stargateClient);
    }

    public static async getWalletsFromMnemonic(
        provider: Provider,
        mnemonic: string,
        amount: number,
        options?: WalletOptions
    ): Promise<Wallet[]> {
        checkProvider(provider);
        const paths = [];
        if (amount <= 1) {
            throw 'Amount must be greater than one';
        }
        for (let i = 0; i < amount; i++) {
            paths.push(makeCosmoshubPath(i));
        }
        const wallets = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
            hdPaths: paths,
            prefix: provider.bech32Prefix,
        });
        const accounts = await wallets.getAccounts();
        const results = [];
        for (let i = 0; i < accounts.length; i++) {
            let cosmWasmClient: SigningCosmWasmClient;
            let stargateClient: SigningStargateClient;
            if (options != undefined) {
                cosmWasmClient = await SigningCosmWasmClient.connectWithSigner(
                    provider.rpcUrl,
                    wallets,
                    options.cosmWasmOptions
                );
                stargateClient = await SigningStargateClient.connectWithSigner(
                    provider.rpcUrl,
                    wallets,
                    options.stargateOptions
                );
            } else {
                cosmWasmClient = await SigningCosmWasmClient.connectWithSigner(
                    provider.rpcUrl,
                    wallets
                );
                stargateClient = await SigningStargateClient.connectWithSigner(
                    provider.rpcUrl,
                    wallets
                );
            }
            results.push(
                new Wallet(provider, wallets, accounts[i], cosmWasmClient, stargateClient)
            );
        }
        return results;
    }

    public static async getWalletsFromOfflineSigner(
        provider: Provider,
        signer: OfflineSigner,
        options?: WalletOptions
    ): Promise<Wallet[]> {
        checkProvider(provider);
        const results = [];
        const accounts = await signer.getAccounts();
        for (let i = 0; i < accounts.length; i++) {
            let cosmWasmClient: SigningCosmWasmClient;
            let stargateClient: SigningStargateClient;
            if (options != undefined) {
                cosmWasmClient = await SigningCosmWasmClient.connectWithSigner(
                    provider.rpcUrl,
                    signer,
                    options.cosmWasmOptions
                );
                stargateClient = await SigningStargateClient.connectWithSigner(
                    provider.rpcUrl,
                    signer,
                    options.stargateOptions
                );
            } else {
                cosmWasmClient = await SigningCosmWasmClient.connectWithSigner(
                    provider.rpcUrl,
                    signer
                );
                stargateClient = await SigningStargateClient.connectWithSigner(
                    provider.rpcUrl,
                    signer
                );
            }
            results.push(
                new Wallet(provider, signer, accounts[i], cosmWasmClient, stargateClient)
            );
        }
        return results;
    }

    private constructor(
        provider: Provider,
        signer: OfflineSigner,
        account: AccountData,
        cosmWasmSigner: SigningCosmWasmClient,
        stargateSigner: SigningStargateClient
    ) {
        this._provider = provider;
        this._signer = signer;
        this._account = account;
        this._cosmWasmSigner = cosmWasmSigner;
        this._stargateSigner = stargateSigner;
    }

    get address(): string {
        return this._account.address;
    }

    get denom(): string {
        return this._provider.feeToken;
    }

    get provider(): Provider {
        return this._provider;
    }

    get signer(): OfflineSigner {
        return this._signer;
    }

    get cosmWasmSigner(): SigningCosmWasmClient {
        return this._cosmWasmSigner;
    }

    get stargateSigner(): SigningStargateClient {
        return this._stargateSigner;
    }

    public coin(denom: string, amount: string): Coin {
        const coin: Coin = {
            denom: denom,
            amount: amount
        }
        return coin;
    }
}

const checkProvider = (provider: Provider) => {
    if (provider.bech32Prefix == undefined || provider.feeToken == undefined) {
        throw "Require set bech32Prefix and feeToken for Provider";
    }
}
