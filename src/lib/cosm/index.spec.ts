import { DirectSecp256k1HdWallet, Registry } from '@cosmjs/proto-signing';
import { AccountData } from '@cosmjs/proto-signing/build/signer';
import { SigningStargateClient } from '@cosmjs/stargate';
import { PrivateSigningStargateClient } from '@cosmjs/stargate/build/signingstargateclient';
import { expect } from 'chai';
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx';
import { BondStatus } from 'cosmjs-types/cosmos/staking/v1beta1/staking';
import Long from 'long';
import 'mocha';

import { BaseProvider } from '../providers';

import { defaultSigningClientOptions, faucet } from './testutils.spec';

import Cosm from './index';

// const rpcUrl = 'https://testnet.rpc.orai.io';
// const rpcUrl = 'https://cosmos-testnet-rpc.allthatnode.com:26657';
const rpcUrl = 'https://osmosis-testnet-rpc.allthatnode.com:26657';
let provider;
let cosm;
let wallet: DirectSecp256k1HdWallet;
let client;
let account: AccountData;
// const prefix = 'cosmos';
const prefix = 'osmo';
let currentBlock;

let validatorAddr;
let delegation;

describe('Cosm test', async () => {
  before('Connect', async () => {
    provider = new BaseProvider();
    await provider.connect(rpcUrl);
    cosm = new Cosm(provider);

    wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
      prefix: prefix,
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
      .block(currentBlock - 100)
      .query.Validators({ status: BondStatus[BondStatus.BOND_STATUS_BONDED] });
    // console.log(queryValidatorsResponse);

    validatorAddr = queryValidatorsResponse.validators[0].operatorAddress;
    const validatorDelegationsResponse = await cosm.cosmos.staking
      .block(currentBlock - 100)
      .query.ValidatorDelegations({ validatorAddr: validatorAddr });

    delegation = validatorDelegationsResponse.delegationResponses[0].delegation;
  });
  describe('test client', async () => {
    it('should lookup MsgCustom success', function () {
      const openedClient = client as unknown as PrivateSigningStargateClient;
      expect(openedClient.registry.lookupType('/custom.MsgCustom')).is.equal(
        MsgSend
      );
    });
  });
  describe('Get blockchain information', async () => {
    it('should get blockchain info', async function () {
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
        address: delegation.delegatorAddress,
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
        .block(currentBlock - 10)
        .query.TotalSupply({});
      // console.log(totalSupplyResponse);
      expect(totalSupplyResponse).is.not.empty;

      const paramsResponse = await cosm.cosmos.bank
        .block(currentBlock - 11)
        .query.Params({});
      // console.log(paramsResponse);
      expect(paramsResponse).is.not.empty;

      const denomsMetadataResponse = await cosm.cosmos.bank
        .block(currentBlock - 12)
        .query.DenomsMetadata({});
      // console.log(denomsMetadataResponse);
      expect(denomsMetadataResponse).is.not.empty;
    });

    it('should get bank account info', async () => {
      const allBalancesResponse = await cosm.cosmos.bank
        .block(currentBlock - 12)
        .query.AllBalances({ address: delegation.delegatorAddress });
      // console.log(allBalancesResponse);
      expect(allBalancesResponse).is.not.empty;
    });
  });

  describe('Test staking query', async () => {
    it('should get staking info', async function () {
      const staking = cosm.cosmos.staking;
      const queryValidatorsResponse = await staking
        .block(currentBlock - 100)
        .query.Validators({
          status: BondStatus[BondStatus.BOND_STATUS_BONDED],
        });
      // console.log(queryValidatorsResponse);
      expect(queryValidatorsResponse.validators).is.not.eq(undefined);

      const validatorResponse = await staking
        .block(currentBlock - 100)
        .query.Validator({ validatorAddr: validatorAddr });
      // console.log(validatorResponse);
      expect(validatorResponse).is.not.eq(undefined);

      const validatorDelegationsResponse = await staking
        .block(currentBlock - 100)
        .query.ValidatorDelegations({ validatorAddr: validatorAddr });
      // console.log(validatorDelegationsResponse);
      expect(validatorDelegationsResponse).is.not.eq(undefined);

      let queryParamsResponse = await staking.query.Params({});
      // console.log(queryParamsResponse);
      expect(queryParamsResponse).is.not.empty;

      let queryHistoricalInfoResponse = await staking.query.HistoricalInfo({
        height: Long.fromNumber(currentBlock),
      });
      // console.log(queryHistoricalInfoResponse);
      expect(queryHistoricalInfoResponse).is.not.empty;
    });

    it('should get delegator info', async () => {
      const staking = cosm.cosmos.staking;

      let queryDelegatorDelegationsResponse =
        await staking.query.DelegatorDelegations({
          delegatorAddr: account.address,
        });
      // console.log(queryDelegatorDelegationsResponse);
      expect(queryDelegatorDelegationsResponse).is.not.empty;

      let queryDelegatorUnbondingDelegationsResponse =
        await staking.query.DelegatorUnbondingDelegations({
          delegatorAddr: account.address,
        });
      // console.log(queryDelegatorUnbondingDelegationsResponse);
      expect(queryDelegatorUnbondingDelegationsResponse).is.not.empty;

      let queryDelegatorValidatorsResponse =
        await staking.query.DelegatorValidators({
          delegatorAddr: account.address,
        });
      // console.log(queryDelegatorValidatorsResponse);
      expect(queryDelegatorValidatorsResponse).is.not.empty;

      const validatorDelegationsResponse = await staking
        .block(currentBlock - 100)
        .query.ValidatorDelegations({ validatorAddr: validatorAddr });

      const delegation =
        validatorDelegationsResponse.delegationResponses[0].delegation;

      let queryDelegationResponse = await staking.query.Delegation({
        delegatorAddr: delegation.delegatorAddress,
        validatorAddr: delegation.validatorAddress,
      });
      // console.log(queryDelegationResponse);
      expect(queryDelegationResponse).is.not.empty;

      // let queryUnbondingDelegationResponse = await staking.query.UnbondingDelegation({
      //   delegatorAddr: delegation.delegatorAddress,
      //   validatorAddr: delegation.validatorAddress
      // });
      // console.log(queryDelegationResponse);
      // expect(queryUnbondingDelegationResponse).is.not.empty;

      let queryDelegatorValidatorResponse =
        await staking.query.DelegatorValidator({
          delegatorAddr: delegation.delegatorAddress,
          validatorAddr: delegation.validatorAddress,
        });
      // console.log(queryDelegatorValidatorResponse);
      expect(queryDelegatorValidatorResponse).is.not.empty;
    });
  });

  describe('Test distribution query', async () => {
    it('should get distribution info', async function () {
      const distribution = cosm.cosmos.distribution;

      const validatorDelegationsResponse = await cosm.cosmos.staking
        .block(currentBlock - 100)
        .query.ValidatorDelegations({ validatorAddr: validatorAddr });

      const delegation =
        validatorDelegationsResponse.delegationResponses[0].delegation;

      let queryParamsResponse = await distribution.query.Params({});
      // console.log("queryParamsResponse");
      // console.log(queryParamsResponse);

      let queryValidatorOutstandingRewardsResponse =
        await distribution.query.ValidatorOutstandingRewards({
          validatorAddress: validatorAddr,
        });
      // console.log("queryValidatorOutstandingRewardsResponse");
      // console.log(queryValidatorOutstandingRewardsResponse);

      let queryValidatorCommissionResponse =
        await distribution.query.ValidatorCommission({
          validatorAddress: validatorAddr,
        });
      // console.log("queryValidatorCommissionResponse");
      // console.log(queryValidatorCommissionResponse);

      let queryDelegationRewardsResponse =
        await distribution.query.DelegationRewards(delegation);
      // console.log("queryDelegationRewardsResponse");
      // console.log(queryDelegationRewardsResponse);

      let queryDelegationTotalRewardsResponse =
        await distribution.query.DelegationTotalRewards({
          delegatorAddress: delegation.delegatorAddress,
        });
      // console.log("queryDelegationTotalRewardsResponse");
      // console.log(queryDelegationTotalRewardsResponse);

      let queryDelegatorValidatorsResponse =
        await distribution.query.DelegatorValidators({
          delegatorAddress: delegation.delegatorAddress,
        });
      // console.log("queryDelegatorValidatorsResponse");
      // console.log(queryDelegatorValidatorsResponse);

      let queryDelegatorWithdrawAddressResponse =
        await distribution.query.DelegatorWithdrawAddress({
          delegatorAddress: delegation.delegatorAddress,
        });
      // console.log("queryDelegatorWithdrawAddressResponse");
      // console.log(queryDelegatorWithdrawAddressResponse);

      let queryCommunityPoolResponse = await distribution.query.CommunityPool(
        {}
      );
      // console.log('queryCommunityPoolResponse');
      // console.log(queryCommunityPoolResponse);
    });
  });
});
