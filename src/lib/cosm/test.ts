import { BaseProvider } from '../providers';

import Cosm from './index';

// let rpcUrl = 'https://osmosis-rpc.polkachu.com';
const rpcUrl = 'https://sifchain-rpc.polkachu.com';

async function test2() {
  const provider = new BaseProvider();
  await provider.connect(rpcUrl);
  const cosm = new Cosm(provider);

  // let denom = await cosm.cosmos.mint.prefixServices('osmosis').query.Params({});
  const denom = await cosm.cosmos.mint.query.Params({});
  console.log(denom);
}

test2();
