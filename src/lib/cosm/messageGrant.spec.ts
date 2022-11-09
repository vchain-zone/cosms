import {
  AuthorizationType,
  StakeAuthorization
} from 'cosmjs-types/cosmos/staking/v1beta1/authz';
import Long from 'long';
import 'mocha';
import { BaseProvider } from '../providers';
import { Wallet } from '../wallet';
import Cosm from './index';

const fee = {
  amount: [
    {
      denom: 'stake',
      amount: '200'
    }
  ],
  gas: '180000' // 180k
};

const rpcUrl = 'http://159.223.35.6:27010/';
const operator = 'cosmosvaloper1zk4sn5ch33knss640wv90rwcvcwhlfnujfzksd';
const granterPrivate = 'verify client drill seat loud below actor elegant split thank edge amused pudding token crime network entire orbit fault century tattoo sunset old forget';
const granteePrivate = 'sadness kit excuse arctic apart spring become hotel extra escape dune flush business lava involve only powder practice gun excess change surge equal speak';
const bech32Prefix = 'cosmos';
const feeToken = 'stake';
let provider;
let granterWallet;
let granteeWallet;
let cosm: Cosm;

describe('Cosm test', async () => {
  before('Connect', async () => {
    // setup wallet
    provider = new BaseProvider();
    await provider.connect(rpcUrl, bech32Prefix, feeToken);
    cosm = new Cosm(provider);

    granterWallet = await Wallet.getWalletFromMnemonic(provider, granterPrivate);
    granteeWallet = await Wallet.getWalletFromMnemonic(provider, granteePrivate);

    const fee = {
      amount: [
        {
          denom: 'stake',
          amount: '2000'
        }
      ],
      gas: '180000' // 180k
    };
    await cosm.setWallet(granterWallet);
  });

  describe('Grant in authz', async () => {
    it('Enable grant DELEGATE', async function() {
      // enable grant for DELEGATE

      let typeUrl = '/cosmos.staking.v1beta1.StakeAuthorization';
      const authorization = StakeAuthorization.encode({
        allowList: {
          address: [operator]
        },
        authorizationType: AuthorizationType.AUTHORIZATION_TYPE_DELEGATE
      }).finish();

      await cosm.cosmos.authz.message.Grant({
        granter: granterWallet.address,
        grantee: granteeWallet.address,
        grant: {
          authorization: {
            typeUrl: typeUrl,
            value: Uint8Array.from(
              authorization
            )
          },
          expiration: {
            seconds: Long.fromNumber(31536000000),
            nanos: 0
          }
        }
      });

      let tx = await cosm.cosmos.authz.sendMessage(fee, 'Setup for enable auto compound staking ');
      console.log(tx);

      const grants = await cosm.cosmos.authz.query.GranteeGrants({
        grantee: granteeWallet.address
      });
      console.log(grants);
      console.log(grants.grants[0].expiration);
    });

    it('Disable grant DELEGATE', async function() {
      await cosm.cosmos.authz.message.Revoke({
        granter: granterWallet.address,
        grantee: granteeWallet.address,
        msgTypeUrl: '/cosmos.staking.v1beta1.MsgDelegate'

      });

      let tx2 = await cosm.cosmos.authz.sendMessage(fee, 'Setup auto compound staking ');
      console.log(tx2);

      const grants2 = await cosm.cosmos.authz.query.Grants({
        grantee: granteeWallet.address,
        granter: granterWallet.address,
        msgTypeUrl: '/cosmos.staking.v1beta1.MsgDelegate'
      });

      console.log(grants2);
    });
  });
});
