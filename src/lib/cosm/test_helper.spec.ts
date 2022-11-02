import 'mocha';
import { BaseProvider } from '../providers';

import Cosm from './index';

const rpcUrl = 'https://testnet.rpc.orai.io';
// const rpcUrl = "https://public-rpc1.stafihub.io";
// const rpcUrl = "https://rpc-cosmoshub.keplr.app";
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

  describe('Test message', async () => {
    it('Test helper', async function() {

      const start = 8568000;
      const end = 8568202;

      let uptime =  await cosm.helper.getUptime(start, end);
      console.log(uptime);
    });
  });
});
