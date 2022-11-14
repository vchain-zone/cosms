import { pubkeyToAddress } from '@cosmjs/tendermint-rpc/build/addresses';
import {
  QueryValidatorOutstandingRewardsResponse
} from 'cosmjs-types/cosmos/distribution/v1beta1/query';
import {
  QueryValidatorsResponse
} from 'cosmjs-types/cosmos/staking/v1beta1/query';
import { BondStatus } from 'cosmjs-types/cosmos/staking/v1beta1/staking';
import { Any } from 'cosmjs-types/google/protobuf/any';

import crypto from 'crypto';
import { BaseProvider } from '../providers';

import Cosm from './index';
// const rpcUrl = 'http://167.99.119.182:46657';
const rpcUrl = 'https://rpc.orai.io';

async function test2() {
  const provider = new BaseProvider();
  await provider.connect(rpcUrl);
  const cosm = new Cosm(provider);

  const latestBlock = await provider.batchQueryClient.getHeight();
  const sampleValAddress = 'oraivaloper1ltr3sx9vm9hq4ueajvs7ng24gw3k8t9tn5lh6s';

  let val = await cosm.cosmos.staking.query.Validator({ validatorAddr: sampleValAddress });

  let cosPub = val.validator.consensusPubkey.value

  const address = pubkeyToAddress("ed25519",cosPub.slice(2,34))
  console.log(address);

  /// query validator multi blocks

  // 1.create batch query

  // 1.1. Validator batch requests
  for (let i = 0; i < 10; i++) {
    let block = latestBlock - i;
    let requestId = `validatorAt${block}`;
    await cosm.cosmos.staking
      .queryBatch.block(block).setId(requestId).Validators({
        status: BondStatus[BondStatus.BOND_STATUS_BONDED]
      });
  }

  // 1.2. Reward batch requests
  for (let i = 0; i < 10; i++) {
    let block = latestBlock - i;
    let requestId = `reward${block}`;
    await cosm.cosmos.distribution
      .queryBatch.block(block).setId(requestId).ValidatorOutstandingRewards({
        validatorAddress: sampleValAddress
      });
  }

  // 2.view created query (optional)

  let batchRequests = cosm.provider.getBatchRequest();
  console.log(batchRequests);

  // 3. sent batch query get raw data
  let results = await cosm.provider.doCallBatch();
  console.log(results);


  // 4. decode result
  let decodedResult = {};
  for (let i = 0; i < 10; i++) {
    let block = latestBlock - i;
    let requestId = `validatorAt${block}`;
    let data = results[requestId];
    let dataDecoded = QueryValidatorsResponse.decode(data.value);
    decodedResult[requestId] = dataDecoded;
  }

  for (let i = 0; i < 10; i++) {
    let block = latestBlock - i;
    let requestId = `reward${block}`;
    let data = results[requestId];
    let dataDecoded = QueryValidatorOutstandingRewardsResponse.decode(data.value);
    decodedResult[requestId] = dataDecoded;
  }



  console.log(decodedResult);


}

test2();
