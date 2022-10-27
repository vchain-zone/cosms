import Cosmos from '../cosmos';
import { BaseProvider } from '../providers';

export default class APRCalCulator {
  cosmos: Cosmos;
  provider: BaseProvider | any;
  constructor(cosmos: any, provider: BaseProvider | any) {
    this.cosmos = cosmos;
    this.provider = provider;
  }
  async stakingAPR(decimal: number): Promise<number> {
    const inflation = await this.inflation(decimal);
    const communityTax = await this.communityTax(decimal);
    const bondedTokensRatio = await this.bondedTokensRatio();
    return (inflation * (1 - communityTax)) / bondedTokensRatio;
  }
  async annualProvisions(decimal: number): Promise<number> {
    const annualProvisions = await this.cosmos.mint.query.AnnualProvisions({});
    return uint8ArrayStringToNumber(annualProvisions.annualProvisions, decimal);
  }
  async actualStakingAPR(decimal: number): Promise<number> {
    const stakingAPR = await this.stakingAPR(decimal);
    const actualProvisionsRatio = await this.actualProvisionsRatio();
    return stakingAPR * actualProvisionsRatio;
  }
  async finalStakingAPR(
    validatorAddress: string,
    mintDecimal: number,
    distributionDecimal: number
  ): Promise<number> {
    const actualStakingAPR = await this.actualStakingAPR(mintDecimal);
    const validatorCommission = await this.validatorCommission(
      validatorAddress,
      distributionDecimal
    );
    return actualStakingAPR * (1 - validatorCommission);
  }
  async inflation(decimal: number): Promise<number> {
    const data = await this.cosmos.mint.query.Inflation({});
    const inflation = uint8ArrayStringToNumber(data.inflation, decimal);
    return inflation;
  }
  async communityTax(decimal: number): Promise<number> {
    const data = await this.cosmos.distribution.query.Params({});
    const communityTax = uint8ArrayStringToNumber(
      data.params.communityTax,
      decimal
    );
    return communityTax;
  }
  async bondedTokens(): Promise<number> {
    const data = await this.cosmos.staking.query.Pool({});
    const bondedTokens = uint8ArrayStringToNumber(data.pool.bondedTokens, 0);
    return bondedTokens;
  }
  async notBondedTokens(): Promise<number> {
    const data = await this.cosmos.staking.query.Pool({});
    const notBondedTokens = uint8ArrayStringToNumber(
      data.pool.notBondedTokens,
      0
    );
    return notBondedTokens;
  }
  async bondedTokensRatio(): Promise<number> {
    const mintDenom = (await this.cosmos.mint.query.Params({})).params.mintDenom;
    let currentSupply: any = (
      await this.cosmos.bank.query.SupplyOf({ denom: mintDenom })
    ).amount.amount;
    currentSupply = parseFloat(currentSupply);
    const bondedTokens = await this.bondedTokens();
    const bondedTokensRatio = bondedTokens / currentSupply;
    return bondedTokensRatio;
  }
  async actualProvisionsRatio(): Promise<number> {
    const estBlockPerYear = (
      await this.cosmos.mint.query.Params({})
    ).params.blocksPerYear.toNumber();
    const estBlockTime = (86400 * 365.25) / estBlockPerYear;
    const height = await this.provider.batchQueryClient.getHeight();
    const block = await this.provider.batchQueryClient.getBlock(height);
    const preBlock = await this.provider.batchQueryClient.getBlock(height - 1000);
    const currentBlockTime = Date.parse(block.header.time);
    const preBlockTime = Date.parse(preBlock.header.time);
    const statBlockTime = (currentBlockTime - preBlockTime) / 1000000;
    const actualProvisionsRatio = estBlockTime / statBlockTime;
    return actualProvisionsRatio;
  }
  async validatorCommission(
    validatorAddress: string,
    decimal: number
  ): Promise<number> {
    const data = await this.cosmos.distribution.query.ValidatorCommission({
      validatorAddress: validatorAddress,
    });
    const validatorCommission = uint8ArrayStringToNumber(
      data.commission.commission[0].amount,
      decimal
    );
    return validatorCommission;
  }
}
function uint8ArrayStringToNumber(
  x: Uint8Array | string,
  decimal: number
): number {
  let xStr = Buffer.from(x).toString();
  const xlen = xStr.length;
  if (xlen < decimal) {
    xStr = '.' + '0'.repeat(decimal - xlen) + xStr;
  } else if (xlen === decimal) {
    xStr = '.' + xStr;
  } else {
    xStr = xStr.slice(0, xlen - decimal) + '.' + xStr.slice(xlen - decimal);
  }
  return parseFloat(xStr);
}
