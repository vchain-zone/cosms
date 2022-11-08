import Cosmos from '../cosmos';
import { BaseProvider } from '../providers';

export default class APRCalCulator {
  cosmos: Cosmos;
  provider: BaseProvider | any;
  constructor(cosmos: any, provider: BaseProvider | any) {
    this.cosmos = cosmos;
    this.provider = provider;
  }
  /**
   * STAKING_APR = [INFLATION*(1-COMMUNITY_TAX)/BONDED_TOKENS_RATIO]
   * @param decimal mint decimal
   * @returns Staking APR theoretically
   */
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
  /**
   * ACTUAL_STAKING_APR = STAKING_APR*[ACTUAL_ANNUAL_PROVISION/ANNUAL_PROVISION]
   * @param decimal mint decimal
   * @returns actual staking APR 
   */
  async actualStakingAPR(decimal: number): Promise<number> {
    const stakingAPR = await this.stakingAPR(decimal);
    const actualProvisionsRatio = await this.actualProvisionsRatio();
    return stakingAPR * actualProvisionsRatio;
  }
  /**
   * FINAL_STAKING_APR = ACTUAL_STAKING_APR*(1-VALIDATOR'S_COMMISSION)
   * @note This function calculate staking apr for each validator's commission
   * @param validatorAddress address of validator
   * @param mintDecimal mint decimal
   * @param distributionDecimal distribution decimal
   * @returns actual staking apr if delegate to validator that have validator'commistion
   */
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
  /**
   * This function to calculator apr from apr
   * @param stakingAPR staking APR 
   * @param partition partitions number of a year
   * @returns 
   */
  async stakingAPY(stakingAPR: number, partition: number = 0): Promise<number> {
    if (partition === 0) {
      return Math.exp(stakingAPR)
    }
    else
      return (1 + stakingAPR / partition) ** partition;
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
