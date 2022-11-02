import * as responses
  from '@cosmjs/tendermint-rpc/build/tendermint35/responses';
import Cosm from '../cosm';

export class Helper {
  private cosm: Cosm;

  constructor(cosm: Cosm) {
    this.cosm = cosm;
  }

  async getBatchBlock(startBlock, endBlock) {
    const tendermint = this.cosm.tendermint;
    for (let i = startBlock; i < endBlock + 1; i++) {
      await tendermint.block(i);
    }
    const blocks = await tendermint.doCallBatch();
    const blockResults = {};
    for (const blocksKey in blocks) {
      let block = blocks[blocksKey];
      let blockHeight = block.block.header.height;
      blockResults[blockHeight] = block;
    }
    return blockResults;
  }

  async getUptime(startBlock, endBlock) {
    let blocks = await this.getBatchBlock(startBlock, endBlock);
    let upTimeResult = {};
    let proposeTimeResult = {};

    for (const blocksKey in blocks) {
      let block: responses.BlockResponse = blocks[blocksKey];
      let proposerAddress = Cosm.utils.uint8Array.toHex(block.block.header.proposerAddress);
      let proposeTime = proposeTimeResult[proposerAddress] | 0;
      proposeTimeResult[proposerAddress] = proposeTime + 1;
      let signatures = block.block.lastCommit.signatures;
      for (const signature of signatures) {
        let validatorAddress = Cosm.utils.uint8Array.toHex(signature.validatorAddress);
        let upTime = upTimeResult[validatorAddress] | 0;
        upTimeResult[validatorAddress] = upTime + 1;
      }
    }
    return {
      startBlock: startBlock,
      endBlock: endBlock,
      upTime: upTimeResult,
      proposeTime: proposeTimeResult
    };
  }
}
