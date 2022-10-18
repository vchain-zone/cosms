import { BaseProvider } from '../providers';
import Cosm from './index';

// let rpcUrl = 'https://osmosis-rpc.polkachu.com';
let rpcUrl = "https://sifchain-rpc.polkachu.com";

async function test2() {
  let provider = new BaseProvider();
  await provider.connect(rpcUrl);
  let cosm = new Cosm(provider);

  // let denom = await cosm.cosmos.mint.prefixServices('osmosis').query.Params({});
  let denom = await cosm.cosmos.mint.query.Params({});
  console.log(denom);
}

test2();
