import Cosmos from "../cosmos";
import { BaseProvider } from "../providers";

export default class APRCalCulator {
    cosmos: Cosmos
    provider: BaseProvider | any;
    constructor(cosmos: any, provider: BaseProvider | any) {
        this.cosmos = cosmos;
        this.provider = provider;
    }
    async stakingAPR(decimal: number): Promise<number> {
        let inflation = await this.inflation(decimal);
        let communityTax = await this.communityTax(decimal);
        let bondedTokensRatio = await this.bondedTokensRatio();
        return (inflation * (1 - communityTax)) / bondedTokensRatio;
    }
    async annualProvisions(decimal: number): Promise<number> {
        let annualProvisions = await this.cosmos.mint.query.AnnualProvisions({});
        return uint8ArrayStringToNumber(annualProvisions.annualProvisions, decimal);
    }
    async actualStakingAPR(decimal: number): Promise<number> {
        let stakingAPR = await this.stakingAPR(decimal);
        let actualProvisionsRatio = await this.actualProvisionsRatio();
        return stakingAPR * actualProvisionsRatio;
    }
    async finalStakingAPR(validatorAddress: string, mintDecimal: number, distributionDecimal: number): Promise<number> {
        let actualStakingAPR = await this.actualStakingAPR(mintDecimal);
        let validatorCommission = await this.validatorCommission(validatorAddress, distributionDecimal);
        return actualStakingAPR * (1 - validatorCommission);
    }
    async inflation(decimal: number): Promise<number> {
        let data = await this.cosmos.mint.query.Inflation({});
        let inflation = uint8ArrayStringToNumber(data.inflation, decimal);
        return inflation;
    }
    async communityTax(decimal: number): Promise<number> {
        let data = await this.cosmos.distribution.query.Params({});
        let communityTax = uint8ArrayStringToNumber(data.params.communityTax, decimal);
        return communityTax
    }
    async bondedTokens(): Promise<number> {
        let data = await this.cosmos.staking.query.Pool({});
        let bondedTokens = uint8ArrayStringToNumber(data.pool.bondedTokens, 0);
        return bondedTokens
    }
    async notBondedTokens(): Promise<number> {
        let data = await this.cosmos.staking.query.Pool({});
        let notBondedTokens = uint8ArrayStringToNumber(data.pool.notBondedTokens, 0);
        return notBondedTokens
    }
    async bondedTokensRatio(): Promise<number> {
        let mintDenom = (await this.cosmos.mint.query.Params({})).params.mintDenom;
        let currentSupply: any = (await this.cosmos.bank.query.SupplyOf({ denom: mintDenom })).amount.amount;
        currentSupply = parseFloat(currentSupply);
        let bondedTokens = await this.bondedTokens();
        let bondedTokensRatio = bondedTokens / currentSupply;
        return bondedTokensRatio;
    }
    async actualProvisionsRatio(): Promise<number> {
        let estBlockPerYear = (await this.cosmos.mint.query.Params({})).params.blocksPerYear.toNumber();
        let estBlockTime = 86400 * 365.25 / estBlockPerYear;
        let height = await this.provider.batchQueryClient.getHeight();
        let block = await this.provider.batchQueryClient.getBlock(height);
        let preBlock = await this.provider.batchQueryClient.getBlock(height - 1000);
        let currentBlockTime = Date.parse(block.header.time);
        let preBlockTime = Date.parse(preBlock.header.time);
        let statBlockTime = (currentBlockTime - preBlockTime) / 1000000
        let actualProvisionsRatio = estBlockTime / statBlockTime;
        return actualProvisionsRatio;
    }
    async validatorCommission(validatorAddress: string, decimal: number): Promise<number> {
        let data = await this.cosmos.distribution.query.ValidatorCommission({ validatorAddress: validatorAddress })
        let validatorCommission = uint8ArrayStringToNumber(data.commission.commission[0].amount, decimal)
        return validatorCommission;
    }
}
function uint8ArrayStringToNumber(x: Uint8Array | string, decimal: number): number {
    let xStr = Buffer.from(x).toString();
    let xlen = xStr.length;
    if (xlen < decimal) {
        xStr = "." + "0".repeat(decimal - xlen) + xStr;
    }
    else if (xlen === decimal) {
        xStr = "." + xStr;
    }
    else {
        xStr = xStr.slice(0, xlen - decimal) + "." + xStr.slice(xlen - decimal);
    }
    return parseFloat(xStr);
}
