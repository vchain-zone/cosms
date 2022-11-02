import * as responses
  from '@cosmjs/tendermint-rpc/build/tendermint35/responses';
import deepmerge from 'deepmerge';
import Cosm from '../cosm';
import { breakToRanges, mergeWithAdd } from '../utils/range';

export class Helper {
  private cosm: Cosm;

  constructor(cosm: Cosm) {
    this.cosm = cosm;
  }

  async getBlocks(startBlock, endBlock) {
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

  async getBatchBlock(startBlock, endBlock, batchSize = 1000) {
    const ranges = breakToRanges(startBlock, endBlock, batchSize);
    let blockResults = {};
    for (const range of ranges) {
      let blocks = await this.getBlocks(range[0], range[1]);
      blockResults = { ...blockResults, ...blocks };
    }
    return blockResults;
  }

  async getUptime(startBlock, endBlock) {
    let blocks = await this.getBlocks(startBlock, endBlock);
    let upTimeResult = {};
    let proposeTimeResult = {};

    for (const blocksKey in blocks) {
      let block: responses.BlockResponse = blocks[blocksKey];
      let proposerAddress = Cosm.utils.uint8Array.toHex(block.block.header.proposerAddress);
      let proposeTime = proposeTimeResult[proposerAddress] | 0;
      proposeTimeResult[proposerAddress] = proposeTime + 1;
      let signatures = block.block.lastCommit.signatures;
      for (const signature of signatures) {
        try {
          let validatorAddress = Cosm.utils.uint8Array.toHex(signature.validatorAddress);
          let upTime = upTimeResult[validatorAddress] | 0;
          upTimeResult[validatorAddress] = upTime + 1;
        } catch (e) {
          console.debug(`Warn: block.lastCommit.signatures : signature ${JSON.stringify(signature)}`);
        }

      }
    }
    return {
      startBlock: startBlock,
      endBlock: endBlock,
      upTime: upTimeResult,
      proposeTime: proposeTimeResult
    };
  }

  async getUptimeBatch(startBlock, endBlock, batchSize = 1000) {
    let ranges = breakToRanges(startBlock, endBlock, batchSize);
    let upTimeResults = {
      startBlock: startBlock,
      endBlock: endBlock,
      upTime: {},
      proposeTime: {}
    };


    for (const range of ranges) {
      const upTime = await this.getUptime(range[0], range[1]);
      upTimeResults.upTime = deepmerge(upTime.upTime,upTimeResults.upTime);
      upTimeResults.proposeTime = deepmerge(upTime.proposeTime,upTimeResults.proposeTime);

    }
    return upTimeResults;
  }
}

