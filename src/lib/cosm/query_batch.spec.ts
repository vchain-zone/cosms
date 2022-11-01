import 'mocha';
import { BaseProvider } from '../providers';
import { Bech32Helper } from '../utils/bench32helper';
import { Uint8ArrayHelper } from '../utils/Uint8ArrayHelper';

import Cosm from './index';

const rpcUrl = 'https://testnet.rpc.orai.io';
// const rpcUrl = "https://public-rpc1.stafihub.io";
// const rpcUrl = "https://rpc-cosmoshub.keplr.app";
// const rpcUrl = "https://rpc-osmosis.keplr.app";
// const rpcUrl = 'https://osmosis-testnet-rpc.allthatnode.com:26657';
let provider;
let cosm: Cosm;
let prefix ="oraivalcons"

describe('Cosm test', async () => {
  before('Connect', async () => {
    provider = new BaseProvider();
    await provider.connect(rpcUrl);
    cosm = new Cosm(provider);
  });

  describe('Test message', async () => {
    it('should get account', async function () {
      const tendermint = cosm.tendermint;
      for (let i = 8568000; i < 8568202; i++) {
        await tendermint.block(i);
      }
      const txs = await tendermint.doCallBatch();
      for (const txsKey in txs) {
        let tx = txs[txsKey];
        let blockHeight = tx.block.header.height;
        let proposerAddress = Bech32Helper.fromBytes(prefix,tx.block.header.proposerAddress)
        let hash = Uint8ArrayHelper.toHex(tx.blockId.hash);
        console.log(`block : ${blockHeight}`);
        console.log(`proposerAddress : ${proposerAddress}`);
        console.log(`hash : ${hash}`);
      }
      console.log(txs);
    });
  });
});
