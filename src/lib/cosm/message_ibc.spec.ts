import { Registry } from '@cosmjs/proto-signing';
import { AccountData } from '@cosmjs/proto-signing/build/signer';
import { coin } from '@cosmjs/stargate';
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx';
import { Coin } from 'cosmjs-types/cosmos/base/v1beta1/coin';
import { BondStatus } from 'cosmjs-types/cosmos/staking/v1beta1/staking';
import 'mocha';
import { MsgTransfer } from 'cosmjs-types/ibc/applications/transfer/v1/tx';
import { Height } from 'cosmjs-types/ibc/core/client/v1/client';
import Long from 'long';

import { BaseProvider } from '../providers';
import { Wallet } from '../wallet';

import Cosm from './index';

import { defaultAccount, defaultSigningClientOptions } from './testutils.spec';
import { config } from 'dotenv';
config()
const rpcUrl = 'https://rpc.orai.io';
let provider;
let cosm: Cosm;
let wallet: Wallet;
const prefix = 'orai';
const denom = 'orai';
const m = process.env.MNEMONIC;
let currentBlock;
describe('Cosm test', async () => {
  before('Connect', async () => {
    provider = new BaseProvider();
    await provider.connect(rpcUrl, prefix, denom);
    cosm = new Cosm(provider);

    wallet = await Wallet.getWalletFromMnemonic(
      provider,
      m
    );

    const registry = new Registry();
    registry.register('/custom.MsgCustom', MsgSend);
    const options = { ...defaultSigningClientOptions, registry: registry };
  });
  before('setup network info', async () => {
    currentBlock = await provider.batchQueryClient.getHeight();
  });

  describe('Test message', async () => {
    it('should get account', async function() {
      console.log(wallet.address);
      const balance = await cosm.cosmos.bank.query.AllBalances({
        address: wallet.address
      });
      console.log(balance);

      await cosm.setWallet(wallet);
      const timeoutTimestamp = Long.fromInt(0);

      const transferIbc: MsgTransfer = {
        sourcePort: 'transfer',
        /** the channel by which the packet will be sent */
        sourceChannel: 'channel-13',
        /** the tokens to be transferred */
        token: {
          denom: denom,
          amount: '1000'
        },
        /** the sender address */
        sender: 'orai1s863xxyrj72c6vcecggewzzm9nfxw5l9kte43u',
        /** the recipient address on the destination chain */
        receiver: 'osmo1s863xxyrj72c6vcecggewzzm9nfxw5l9druxxa',

        timeoutHeight: {
          revisionHeight: Long.fromNumber(currentBlock + 100),
          revisionNumber: Long.fromNumber(1)
        },
        /**
         * Timeout timestamp in absolute nanoseconds since unix epoch.
         * The timeout is disabled when set to 0.
         */
        timeoutTimestamp: Long.fromNumber(0)
      };

      await cosm.cosmos.ibc.message.Transfer(transferIbc);

      const currentMessage = cosm.cosmos.staking.getCurrentMessage();
      console.log(currentMessage);

      const fee = {
        amount: [
          {
            denom: 'orai',
            amount: '2000'
          }
        ],
        gas: '180000' // 180k
      };

      const tx = await cosm.cosmos.ibc.sendMessage(fee);
      console.log(tx);
    });
  });
});
