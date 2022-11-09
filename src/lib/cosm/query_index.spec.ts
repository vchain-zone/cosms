import { DirectSecp256k1HdWallet, Registry } from '@cosmjs/proto-signing';
import { AccountData } from '@cosmjs/proto-signing/build/signer';
import { SigningStargateClient } from '@cosmjs/stargate';
import {
  PrivateSigningStargateClient
} from '@cosmjs/stargate/build/signingstargateclient';
import { expect } from 'chai';
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx';
import { BondStatus } from 'cosmjs-types/cosmos/staking/v1beta1/staking';
import Long from 'long';
import 'mocha';
import { Distribution } from '../cosmos/distribution';

import { BaseProvider } from '../providers';

import Cosm from './index';

import { defaultSigningClientOptions, faucet } from './testutils.spec';


const rpcUrl = 'https://testnet.rpc.orai.io';
// const rpcUrl = 'https://rpc.orai.io';
// const rpcUrl = 'https://sifchain-rpc.polkachu.com';
// const rpcUrl = "https://rpc-cosmoshub.keplr.app";
// const rpcUrl = "https://rpc-osmosis.keplr.app";
// const rpcUrl = 'https://osmosis-testnet-rpc.allthatnode.com:26657';
let provider;
let cosm;
let wallet: DirectSecp256k1HdWallet;
let client;
let account: AccountData;
const prefix = 'orai';
// const prefix = 'osmo';
let currentBlock;

let validatorAddr;
let delegation;

describe('Cosm test', async () => {
  before('Connect', async () => {
    provider = new BaseProvider();
    await provider.connect(rpcUrl);
    cosm = new Cosm(provider);

    wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
      prefix: prefix
    });

    account = (await wallet.getAccounts())[0];
    const registry = new Registry();
    registry.register('/custom.MsgCustom', MsgSend);
    const options = { ...defaultSigningClientOptions, registry: registry };
    client = await SigningStargateClient.connectWithSigner(
      rpcUrl,
      wallet,
      options
    );
  });
  before('setup network info', async () => {
    currentBlock = await provider.batchQueryClient.getHeight();
  });

  before('Setup delegation info', async () => {
    const queryValidatorsResponse = await cosm.cosmos.staking
      .query.block(currentBlock - 100).Validators({ status: BondStatus[BondStatus.BOND_STATUS_BONDED] });
    // console.log(queryValidatorsResponse);

    validatorAddr = queryValidatorsResponse.validators[0].operatorAddress;
    const validatorDelegationsResponse = await cosm.cosmos.staking
      .query.block(currentBlock - 100).ValidatorDelegations({ validatorAddr: validatorAddr });

    delegation = validatorDelegationsResponse.delegationResponses[0].delegation;
  });
  describe('test client', async () => {
    it('should lookup MsgCustom success', function() {
      const openedClient = client as unknown as PrivateSigningStargateClient;
      expect(openedClient.registry.lookupType('/custom.MsgCustom')).is.equal(
        MsgSend
      );
    });
  });
  describe('Get blockchain information', async () => {
    it('should get blockchain info', async function() {
      const chainId = await provider.batchQueryClient.getChainId();
      expect(chainId, `Chain id: ${chainId}`).is.not.empty;

      const block = await provider.batchQueryClient.getBlock();
      expect(block, `block: ${block}`).is.not.empty;

      const address = delegation.delegatorAddress;
      const balance = await provider.batchQueryClient.getAllBalances(address);
      expect(balance, `balance of address ${address}: ${balance}`).is.not.eq(
        undefined
      );
    });
  });

  describe('Test auth query', async () => {
    it('should get bank accounts', async () => {
      const _account = await cosm.cosmos.auth.query.Account({
        address: delegation.delegatorAddress
      });
      // console.log(accounts);
      expect(_account).is.not.eq(undefined);

      const parmas = await cosm.cosmos.auth.query.Params({});
      // console.log(parmas);
      expect(parmas).is.not.eq(undefined);
    });
  });

  describe('Test bank query', async () => {
    it('should get bank info', async () => {
      const totalSupplyResponse = await cosm.cosmos.bank
        .query.block(currentBlock - 10).TotalSupply({});
      // console.log(totalSupplyResponse);
      expect(totalSupplyResponse).is.not.empty;

      const paramsResponse = await cosm.cosmos.bank
        .query.block(currentBlock - 11).Params({});
      // console.log(paramsResponse);
      expect(paramsResponse).is.not.empty;

      const denomsMetadataResponse = await cosm.cosmos.bank
        .query
        .block(currentBlock - 12).DenomsMetadata({});
      // console.log(denomsMetadataResponse);
      expect(denomsMetadataResponse).is.not.empty;
    });

    it('should get bank account info', async () => {
      const allBalancesResponse = await cosm.cosmos.bank.query
        .block(currentBlock - 12).AllBalances({ address: delegation.delegatorAddress });
      // console.log(allBalancesResponse);
      expect(allBalancesResponse).is.not.empty;
    });
  });

  describe('Test staking query', async () => {
    it('should get staking info', async function() {
      const staking = cosm.cosmos.staking;
      const queryValidatorsResponse = await staking.query
        .block(currentBlock - 100).Validators({
          status: BondStatus[BondStatus.BOND_STATUS_BONDED]
        });
      // console.log(queryValidatorsResponse);
      expect(queryValidatorsResponse.validators).is.not.eq(undefined);

      const validatorResponse = await staking.query
        .block(currentBlock - 100).Validator({ validatorAddr: validatorAddr });
      // console.log(validatorResponse);
      expect(validatorResponse).is.not.eq(undefined);

      const validatorDelegationsResponse = await staking.query.block(currentBlock - 100).ValidatorDelegations({ validatorAddr: validatorAddr });
      // console.log(validatorDelegationsResponse);
      expect(validatorDelegationsResponse).is.not.eq(undefined);

      const queryParamsResponse = await staking.query.Params({});
      // console.log(queryParamsResponse);
      expect(queryParamsResponse).is.not.empty;

      const queryHistoricalInfoResponse = await staking.query.HistoricalInfo({
        height: Long.fromNumber(currentBlock)
      });
      // console.log(queryHistoricalInfoResponse);
      expect(queryHistoricalInfoResponse).is.not.empty;
    });

    it('should get delegator info', async () => {
      const staking = cosm.cosmos.staking;

      const queryDelegatorDelegationsResponse =
        await staking.query.DelegatorDelegations({
          delegatorAddr: delegation.delegatorAddress
        });
      // console.log(queryDelegatorDelegationsResponse);
      expect(queryDelegatorDelegationsResponse).is.not.empty;

      const queryDelegatorUnbondingDelegationsResponse =
        await staking.query.DelegatorUnbondingDelegations({
          delegatorAddr: delegation.delegatorAddress
        });
      // console.log(queryDelegatorUnbondingDelegationsResponse);
      expect(queryDelegatorUnbondingDelegationsResponse).is.not.empty;

      const queryDelegatorValidatorsResponse =
        await staking.query.DelegatorValidators({
          delegatorAddr: delegation.delegatorAddress
        });
      // console.log(queryDelegatorValidatorsResponse);
      expect(queryDelegatorValidatorsResponse).is.not.empty;

      const queryDelegationResponse = await staking.query.Delegation({
        delegatorAddr: delegation.delegatorAddress,
        validatorAddr: delegation.validatorAddress
      });
      // console.log(queryDelegationResponse);
      expect(queryDelegationResponse).is.not.empty;

      // let queryUnbondingDelegationResponse = await staking.query.UnbondingDelegation({
      //   delegatorAddr: delegation.delegatorAddress,
      //   validatorAddr: delegation.validatorAddress
      // });
      // console.log(queryDelegationResponse);
      // expect(queryUnbondingDelegationResponse).is.not.empty;

      const queryDelegatorValidatorResponse =
        await staking.query.DelegatorValidator({
          delegatorAddr: delegation.delegatorAddress,
          validatorAddr: delegation.validatorAddress
        });
      // console.log(queryDelegatorValidatorResponse);
      expect(queryDelegatorValidatorResponse).is.not.empty;
    });
  });

  describe('Test distribution query', async () => {
    it('should get distribution info', async function() {
      const distribution : Distribution = cosm.cosmos.distribution;

      const validatorDelegationsResponse = await cosm.cosmos.staking
        .query.block(currentBlock - 100).ValidatorDelegations({ validatorAddr: validatorAddr });

      const delegation =
        validatorDelegationsResponse.delegationResponses[0].delegation;

      const queryParamsResponse = await distribution.query.Params({});
      // console.log("queryParamsResponse");
      // console.log(queryParamsResponse);

      const queryValidatorOutstandingRewardsResponse =
        await distribution.query.ValidatorOutstandingRewards({
          validatorAddress: validatorAddr
        });
      // console.log("queryValidatorOutstandingRewardsResponse");
      // console.log(queryValidatorOutstandingRewardsResponse);

      const queryValidatorCommissionResponse =
        await distribution.query.ValidatorCommission({
          validatorAddress: validatorAddr
        });
      // console.log("queryValidatorCommissionResponse");
      // console.log(queryValidatorCommissionResponse);

      const queryDelegationRewardsResponse =
        await distribution.query.DelegationRewards(delegation);
      // console.log("queryDelegationRewardsResponse");
      // console.log(queryDelegationRewardsResponse);

      const queryDelegationTotalRewardsResponse =
        await distribution.query.DelegationTotalRewards({
          delegatorAddress: delegation.delegatorAddress
        });
      // console.log("queryDelegationTotalRewardsResponse");
      // console.log(queryDelegationTotalRewardsResponse);

      const queryDelegatorValidatorsResponse =
        await distribution.query.DelegatorValidators({
          delegatorAddress: delegation.delegatorAddress
        });
      // console.log("queryDelegatorValidatorsResponse");
      // console.log(queryDelegatorValidatorsResponse);

      const queryDelegatorWithdrawAddressResponse =
        await distribution.query.DelegatorWithdrawAddress({
          delegatorAddress: delegation.delegatorAddress
        });
      // console.log("queryDelegatorWithdrawAddressResponse");
      // console.log(queryDelegatorWithdrawAddressResponse);

      const queryCommunityPoolResponse = await distribution.query.CommunityPool(
        {}
      );
      // console.log('queryCommunityPoolResponse');
      // console.log(queryCommunityPoolResponse);
    });
  });

  describe('Get mint denom', async () => {
    it('should get mint', async function() {
      const mint = cosm.cosmos.mint;
      const mintDenomParams = await mint.query.Params({});
      console.log(mintDenomParams.params);

      // cosm.cosmos.bank.prefixServices("orai")
      // let denoms = await cosm.cosmos.bank.query.DenomsMetadata({ denom: 'orai' });
      // console.log(denoms);
      // let denom = await cosm.cosmos.bank.query.DenomMetadata({ denom: 'orai' });
      // console.log(denom);
    });
  });
});
