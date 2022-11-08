import { expect } from 'chai';
import {
  QueryParamsResponse,
  QueryValidatorsResponse
} from 'cosmjs-types/cosmos/staking/v1beta1/query';
import { BondStatus } from 'cosmjs-types/cosmos/staking/v1beta1/staking';
import 'mocha';
import { BaseProvider } from '../providers';

import Cosm from './index';

// const rpcUrl = 'https://testnet.rpc.orai.io';
const rpcUrl = 'https://rpc.orai.io';
// const rpcUrl = "https://public-rpc1.stafihub.io";
// const rpcUrl = "https://rpc-cosmoshub.keplr.app";
// const rpcUrl = "https://rpc-osmosis.keplr.app";
// const rpcUrl = 'https://osmosis-testnet-rpc.allthatnode.com:26657';
let provider;
let cosm: Cosm;
let prefix = 'oraivalcons';
let currentBlock;

describe('Cosm test', async () => {
  before('Connect', async () => {
    provider = new BaseProvider();
    await provider.connect(rpcUrl);
    cosm = new Cosm(provider);
    currentBlock = await provider.batchQueryClient.getHeight();
  });

  describe('Test message', async () => {
    // it('should get account', async function() {
    //   const tendermint = cosm.tendermint;
    //   for (let i = 8568000; i < 8568202; i++) {
    //     await tendermint.block(i);
    //   }
    //   const txs = await tendermint.doCallBatch();
    //   for (const txsKey in txs) {
    //     let tx = txs[txsKey];
    //     let blockHeight = tx.block.header.height;
    //     let proposerAddress = Cosm.utils.bech32.fromBytes(prefix, tx.block.header.proposerAddress);
    //     let hash = Cosm.utils.uint8Array.toHex(tx.blockId.hash);
    //     console.log(`block : ${blockHeight}`);
    //     console.log(`proposerAddress : ${proposerAddress}`);
    //     console.log(`hash : ${hash}`);
    //   }
    //   console.log(txs);
    // });
  });


  describe('Test batch call', async () => {
    it('should get staking', async function() {
      const queryBatch = cosm.cosmos.staking.queryBatch;
      await queryBatch.setId(10000).Validators({
        status: BondStatus[BondStatus.BOND_STATUS_BONDED]
      });

      await cosm.cosmos.staking
        .queryBatch.block(currentBlock - 10).setId(1232343).Validators({
          status: BondStatus[BondStatus.BOND_STATUS_BONDED]
        });
      await cosm.cosmos.staking
        .queryBatch.block(currentBlock - 10).setId('params').Params({});

      let batchRequests = cosm.provider.getBatchRequest();
      console.log(batchRequests);
      let results = await cosm.provider.doCallBatch();

      console.log('raw data', results);

      batchRequests = cosm.provider.getBatchRequest();
      expect(batchRequests.length).is.eq(0);

      let data = results[10000];
      let dataDecoded = QueryValidatorsResponse.decode(data.value);
      console.log('dataDecoded', dataDecoded);
      let decodedParam = QueryParamsResponse.decode(results['params'].value);
      console.log('decodedParam', decodedParam);

    });
  });
});
