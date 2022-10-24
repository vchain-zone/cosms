import { expect } from 'chai';
import * as dotenv from 'dotenv';

import { BaseProvider } from '../providers';

import { Wallet } from '.';
import 'mocha';

dotenv.config();

// const rpcUrl = 'https://osmosis-testnet-rpc.allthatnode.com:26657';
const RPC_URL = 'https://rpc.malaga-420.cosmwasm.com';
const MNEMONIC = process.env.MNEMONIC;
const PREFIX = 'wasm';
const DENOM = 'umlg';
let provider: BaseProvider;
let wallet: Wallet;
let wallets: Wallet[];

describe('Test wallet', async () => {
    before('Setup', async () => {
        provider = await BaseProvider.fromRpcUrl(RPC_URL);
        provider.bech32Prefix = PREFIX;
        provider.feeToken = DENOM;
    });

    it('Test getWalletFromMnemonic()', async () => {
        wallet = await Wallet.getWalletFromMnemonic(provider, MNEMONIC);
        expect(wallet.address.startsWith(PREFIX)).to.be.true;
        expect(wallet.denom).to.be.equal(DENOM);
    });

    it("Test getWalletsFromMnemonic()", async () => {
        wallets = await Wallet.getWalletsFromMnemonic(provider, MNEMONIC, 10);
        for (let i = 0; i < wallets.length; i++) {
            const wallet = wallets[i];
            expect(wallet.address.startsWith(PREFIX)).to.be.true;
            expect(wallet.denom).to.be.equal(DENOM);
        }
    });

    it("Test getWalletsFromOfflineSigner()", async () => {
        wallet = await Wallet.getWalletFromMnemonic(provider, MNEMONIC);
        const signer = wallet.signer;
        wallets = await Wallet.getWalletsFromOfflineSigner(provider, signer);
        expect(wallets.length).to.be.equal(1);
        expect(wallets[0].address.startsWith(PREFIX)).to.be.true;
        expect(wallets[0].denom).to.be.equal(DENOM);
    });

    it("Test wallet provider", async () => {
        wallet = await Wallet.getWalletFromMnemonic(provider, MNEMONIC);
        wallet.provider.bech32Prefix = "TEST";
        expect(wallet.provider.bech32Prefix).to.be.equal("TEST");
        wallet.provider.bech32Prefix = PREFIX;
        wallet.provider.feeToken = "TEST";
        expect(wallet.provider.feeToken).to.be.equal("TEST");
        wallet.provider.feeToken = DENOM;
    })
});
