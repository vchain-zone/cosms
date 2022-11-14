import 'mocha';
import { expect } from 'chai';
import { BaseProvider } from '../providers';

import Cosm from './index';

// const rpcUrl = 'https://testnet.rpc.orai.io';
const rpcUrl = 'https://rpc.orai.io';
// const rpcUrl = 'https://public-rpc1.stafihub.io';
// const rpcUrl = "https://node1.konstellation.tech:26657";
// const rpcUrl = "https://konstellation-rpc.polkachu.com";
// const rpcUrl = "https://rpc-sifchain.ecostake.com";
// const rpcUrl = "https://rpc-osmosis.keplr.app";
// const rpcUrl = 'https://osmosis-testnet-rpc.allthatnode.com:26657';
let provider;
let cosm: Cosm;
let prefix = 'oraivalcons';

describe('Cosm test', async () => {
  before('Connect', async () => {
    provider = new BaseProvider();
    await provider.connect(rpcUrl);
    cosm = new Cosm(provider);
  });

  describe("Test convert address to difference prefix", ()=>{
    it("Test address orai", ()=>{
      const address = "orai1mxqeldsxg60t2y6gngpdm5jf3k96dnjuanyv3w"
      const addressOpe = "oraivaloper1mxqeldsxg60t2y6gngpdm5jf3k96dnju5el96f"
      const prefix = "orai"
      const prefixOpe = "oraivaloper"

      const hexAddress = Cosm.utils.bech32.toHex(address);
      const addressOpeGen = Cosm.utils.bech32.toBech32(prefixOpe,hexAddress);

      expect(addressOpeGen).is.eq(addressOpe);
      console.log(addressOpeGen);
    })
  })
  describe('Test message', async () => {
    it('Test helper', async function() {

      const end = await provider.batchQueryClient.getHeight();
      const start = end - 9;

      let uptime = await cosm.helper.getUptimeBatch(start, end, 4);
      console.log(uptime);
    });
  });
});

