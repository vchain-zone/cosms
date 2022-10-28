import { Registry } from '@cosmjs/proto-signing';
import { AccountData } from '@cosmjs/proto-signing/build/signer';
import { coin } from '@cosmjs/stargate';
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx';
import { BondStatus } from 'cosmjs-types/cosmos/staking/v1beta1/staking';
import 'mocha';

import { BaseProvider } from '../providers';
import { Wallet } from '../wallet';

import Cosm from './index';

import { defaultAccount, defaultSigningClientOptions } from './testutils.spec';


const rpcUrl = 'https://testnet.rpc.orai.io';
// const rpcUrl = "https://public-rpc1.stafihub.io";
// const rpcUrl = "https://rpc-cosmoshub.keplr.app";
// const rpcUrl = "https://rpc-osmosis.keplr.app";
// const rpcUrl = 'https://osmosis-testnet-rpc.allthatnode.com:26657';
let provider;
let cosm: Cosm;
let wallet: Wallet;
let client;
let account: AccountData;
const prefix = 'orai';
// const prefix = 'cosmos';
// const prefix = 'osmo';
const denom = 'orai';
let currentBlock;

let validatorAddr;
let delegation;

describe('Cosm test', async () => {
  before('Connect', async () => {
    provider = new BaseProvider();
    await provider.connect(rpcUrl,prefix,denom);
    cosm = new Cosm(provider);

    wallet = await Wallet.getWalletFromMnemonic(
      provider,
      defaultAccount.mnemonic
    );

    const registry = new Registry();
    registry.register('/custom.MsgCustom', MsgSend);
    const options = { ...defaultSigningClientOptions, registry: registry };
  });
  before('setup network info', async () => {
    currentBlock = await provider.batchQueryClient.getHeight();
  });

  before('Setup delegation info', async () => {
    const queryValidatorsResponse = await cosm.cosmos.staking
      .block(currentBlock - 100)
      .query.Validators({ status: BondStatus[BondStatus.BOND_STATUS_BONDED] });
    // console.log(queryValidatorsResponse);

    validatorAddr = queryValidatorsResponse.validators[0].operatorAddress;
    const validatorDelegationsResponse = await cosm.cosmos.staking
      .block(currentBlock - 100)
      .query.ValidatorDelegations({ validatorAddr: validatorAddr });

    delegation = validatorDelegationsResponse.delegationResponses[0].delegation;
  });

  describe('Test message', async () => {
    it('should get account', async function() {
      console.log(wallet.address);
      const balance = await cosm.cosmos.bank.query.AllBalances({
        address: wallet.address
      });
      console.log(balance);
      console.log(delegation);

      cosm.setWallet(wallet);

      const delegateInfo = {
        delegatorAddress: wallet.address,
        validatorAddress: delegation.validatorAddress,
        amount: coin(100000, denom)
      };

      await cosm.cosmos.staking.message.Delegate(delegateInfo);

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

      const tx = await cosm.cosmos.staking.sendMessage(fee);
      console.log(tx);
    });
  });
});
