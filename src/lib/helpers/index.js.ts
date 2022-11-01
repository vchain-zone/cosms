import Cosm from '../cosm';
import { Uint8ArrayHelper } from '../utils/Uint8ArrayHelper';

class Helper {
  private cosm: Cosm;

  constructor(cosm: Cosm) {
    this.cosm = cosm;
  }

  async getBatchBlock(start_block, end_block) {
    const tendermint = this.cosm.tendermint;
    for (let i = start_block; i < end_block + 1; i++) {
      await tendermint.block(i);
    }
    const blocks = await tendermint.doCallBatch();
    const block_results = {};
    for (const blocksKey in blocks) {
      let block = blocks[blocksKey];
      block.blockId.hash = Uint8ArrayHelper.toHex(block.blockId.hash);
      block.blockId = Uint8ArrayHelper.toHex(block.blockId);
    }
  }
}
