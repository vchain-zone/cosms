import * as dotenv from 'dotenv';

import { BaseProvider } from '../providers';

import { Wallet } from '.';
import 'mocha';
import { expect } from 'chai';
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
        provider = new BaseProvider();
        await provider.connect(RPC_URL);
        wallet = await Wallet.getWalletFromMnemonic(provider, MNEMONIC, PREFIX, DENOM);
    });

    it('Test getWalletFromMnemonic()', async () => {
        wallet = await Wallet.getWalletFromMnemonic(provider, MNEMONIC, PREFIX, DENOM);

        expect(wallet.address.startsWith(PREFIX)).to.be.true;
        expect(wallet.denom).to.be.equal(DENOM);
    });

    it("Test getWalletsFromMnemonic()", async () => {
        wallets = await Wallet.getWalletsFromMnemonic(provider, MNEMONIC, PREFIX, DENOM, 10);
        for (let i = 0; i < wallets.length; i++) {
            let wallet = wallets[i];
            expect(wallet.address.startsWith(PREFIX)).to.be.true;
            expect(wallet.denom).to.be.equal(DENOM);
        }
    });

    it("Test getWalletsFromOfflineSigner()", async () => {
        wallet = await Wallet.getWalletFromMnemonic(provider, MNEMONIC, PREFIX, DENOM);
        const signer = wallet.signer;
        wallets = await Wallet.getWalletsFromOfflineSigner(provider, signer, DENOM);
        expect(wallets.length).to.be.equal(1);
        expect(wallets[0].address.startsWith(PREFIX)).to.be.true;
        expect(wallets[0].denom).to.be.equal(DENOM);
    });
});
