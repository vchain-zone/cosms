import { expect } from 'chai';
import 'mocha';

import { BaseProvider } from '../providers';

import Cosm from './index';

// const rpcUrl = 'https://testnet.rpc.orai.io';
const rpcUrl = 'https://cosmos-testnet-rpc.allthatnode.com:26657';
let provider;
let cosm;

describe('Cosm test', async () => {

  before('Connect', async () => {
    provider = new BaseProvider();
    await provider.connect(rpcUrl);
    cosm = new Cosm(provider);
  });
  describe("Get blockchain information", async ()=>{
    it('should return chain id', function() {
      const chainId = provider.batchQueryClient.chainId;
      expect(chainId).is.not.empty;
    });
  })


  describe('Test staking message', async () => {

    it('should get vals', async function() {

      const vals1 = await cosm.cosmos.staking.query.validators(
        'BOND_STATUS_BONDED'
      );
      // console.log(vals1);
      expect(vals1.validators).is.not.empty;
    });

  });


});
