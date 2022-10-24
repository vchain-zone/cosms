import * as fs from 'fs';

import { expect } from 'chai';
import * as dotenv from 'dotenv';

import { BaseProvider } from '../providers';
import { Wallet } from '../wallet';

import 'mocha';
import {
    ExecuteMessage,
    InstantiateMessage,
    InstantiateOptions,
    QueryMessage,
    Wasm,
} from '.';

dotenv.config();

// const rpcUrl = 'https://osmosis-testnet-rpc.allthatnode.com:26657';
const RPC_URL = 'https://rpc.malaga-420.cosmwasm.com';
const MNEMONIC = process.env.MNEMONIC;
const PREFIX = 'wasm';
const DENOM = 'umlg';

let provider: BaseProvider;
let wallet: Wallet;
let wasm: Wasm;

describe('Test Wasm', async () => {
    before('Setup', async () => {
        provider = await BaseProvider.fromRpcUrl(RPC_URL, PREFIX, DENOM);
        wallet = await Wallet.getWalletFromMnemonic(provider, MNEMONIC);
        wasm = new Wasm(wallet);
    });

    it('Test interact with contract', async () => {
        const wasmCode = fs.readFileSync(__dirname + '/cw20_base.wasm');
        const uploadResult = await wasm.uploadWasm(wasmCode);
        expect(uploadResult.originalChecksum).to.be.equal(
            'db366741dcbad5f2e4933cda49133cd2a11fdb32b08c67cb1d22379bd392448e'
        );
        expect(uploadResult.compressedChecksum).to.be.equal(
            'c67d7d5a74223be06f90b733bb268132fb492fa274965b48e3d79b1ac5265043'
        );

        const initOptions: InstantiateOptions = {
            memo: 'TEST',
            admin: 'wasm1q0wusjw6an9m7h7qtn73y24frxd4g7wzulxgj0',
        };
        const initMsg: InstantiateMessage = {
            codeId: uploadResult.codeId,
            instantiateMsg: {
                name: 'Raijin Ryuu',
                symbol: 'Ryuu',
                decimals: 6,
                initial_balances: [
                    {
                        address: 'wasm1q0wusjw6an9m7h7qtn73y24frxd4g7wzulxgj0',
                        amount: '1609000000',
                    },
                ],
                mint: {
                    minter: 'wasm1q0wusjw6an9m7h7qtn73y24frxd4g7wzulxgj0',
                    cap: null,
                },
                marketing: {
                    project: "Ryuu's Project",
                    description: "Ryuu's Token",
                    marketing: null,
                    logo: {
                        url: ' https://steamuserimages-a.akamaihd.net/ugc/1660106331075249843/7322A01C17927B77D1EA1CA65C67EED23EB19D36/?imw=637&imh=358&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true',
                    },
                },
            },
            label: 'Deploy cw20 token',
            options: initOptions,
        };
        const initResult = await wasm.initContract(initMsg);
        expect(initResult.contractAddress).to.not.be.null;

        const executeMsg: ExecuteMessage = {
            contractAddr: initResult.contractAddress,
            executeMsg: {
                mint: {
                    amount: '10000000',
                    recipient: 'wasm1q0wusjw6an9m7h7qtn73y24frxd4g7wzulxgj0',
                },
            },
        };
        const executeResult = await wasm.execute(executeMsg, 'TEST');
        // console.log(executeResult);

        const queryMsg: QueryMessage = {
            contractAddr: initResult.contractAddress,
            queryMsg: {
                balance: {
                    address: "wasm1q0wusjw6an9m7h7qtn73y24frxd4g7wzulxgj0"
                }
            }
        };
        const queryResult = await wasm.query(queryMsg);
        // console.log(queryResult);
    });
});
