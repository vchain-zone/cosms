import { expect } from 'chai';
import 'mocha';
import Cosm from './index';


describe('Cosms utils', async () => {

  describe('Test message', async () => {
    it('Test IBC helper', async function() {
      const baseDenom = 'orai';
      const path = 'transfer/channel-216';
      const ibcDenom = 'ibc/161d7d62bab3b9c39003334f1671208f43c06b643cc9edbbe82b64793c857f1d';
      expect(Cosm.utils.IBCHelper.toIBCDenom(baseDenom, path)).to.be.eq(ibcDenom);
    });
  });
});

