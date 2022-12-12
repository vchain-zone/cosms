var axios = require('axios');
// const baseURL = 'https://lcd.orai.io//';
const baseURL = 'https://rest.cosmos.directory//osmosis//';
async function communityTax(): Promise<number> {
    var config = {
        method: 'get',
        url: baseURL + 'distribution/parameters',
        headers: {
            'Accept': 'application/json'
        }
    };
    const response = await axios(config);
    let community_tax = parseFloat(response.data.result.community_tax)
    return community_tax
}
async function inflation(): Promise<number> {
    var config = {
        method: 'get',
        url: baseURL + 'minting/inflation',
        headers: {
            'Accept': 'application/json'
        }
    };
    const response = await axios(config);
    let inflation = parseFloat(response.data.result)
    return inflation;
}
async function bondedTokens(): Promise<number> {
    var config = {
        method: 'get',
        url: baseURL + 'staking/pool',
        headers: {
            'Accept': 'application/json'
        }
    };
    let response = await axios(config);
    let bondedTokens = parseFloat(response.data.result.bonded_tokens);
    return bondedTokens;
}
async function bondedTokensRatio(): Promise<number> {
    var config = {
        method: 'get',
        url: baseURL + 'minting/parameters',
        headers: {
            'Accept': 'application/json'
        }
    };
    let response: any = await axios(config);
    let mintDenom = response.data.result.mint_denom;
    config = {
        method: 'get',
        url: baseURL + 'cosmos/bank/v1beta1/supply/' + mintDenom,
        headers: {
            'Accept': '*/*'
        }
    };
    response = await axios(config);
    let supplyOf = parseFloat(response.data.amount.amount)
    let bondedToken = await bondedTokens();
    let bondedTokensRatio = bondedToken / supplyOf;
    return bondedTokensRatio;
}
async function actualProvisionsRatio() {
    var config: any = {
        method: 'get',
        url: baseURL + 'minting/parameters',
        headers: {
            'Accept': 'application/json'
        }
    };
    let response: any = await axios(config);
    const estBlockPerYear = parseFloat(response.data.result.blocks_per_year);
    const estBlockTime = (86400 * 365.25) / estBlockPerYear;
    config = {
        method: 'get',
        url: baseURL + 'minting/inflation',
        headers: {
            'Accept': 'application/json'
        }
    };
    response = await axios(config);
    let height = response.data.height;
    const currentBlockTime = await getBlocktime(height);
    const preBlockTime = await getBlocktime(height - 1000);
    const statBlockTime = (currentBlockTime - preBlockTime) / 1000000;
    const actualProvisionsRatio = estBlockTime / statBlockTime;
    return actualProvisionsRatio;
}
async function getBlocktime(height: number): Promise<number> {
    var config = {
        method: 'get',
        url: baseURL + 'blocks/' + height,
        headers: {
            'Accept': 'application/json'
        }
    };
    let response = await axios(config);
    let blocktime = response.data.block.header.time;
    return Date.parse(blocktime);
}
async function test2() {
    let validatorAddress = 'oraivaloper1h89umsrsstyeuet8kllwvf2tp630n77aymck78';
    console.log('inflation: ', await inflation());
    console.log('communityTax: ', await communityTax());
    console.log('bondedTokens: ', await bondedTokens());
    console.log('bondedTokensRatio: ', await bondedTokensRatio());
    console.log('actualProvisionRatio: ', await actualProvisionsRatio());
    console.log('validatorCommission: ', await validatorCommission(validatorAddress, 9))
}
async function validatorCommission(validatorAddress: string, decimal: number): Promise<number> {
    var config = {
        method: 'get',
        url: baseURL + 'cosmos/distribution/v1beta1/validators/' + validatorAddress + '/commission',
        headers: {
            'Accept': '*/*'
        }
    };
    let response = await axios(config)
    let validatorCommission = parseFloat(response.data.commission.commission[0].amount) / (10 ** decimal)
    return validatorCommission;
}
/**
   * STAKING_APR = [INFLATION*(1-COMMUNITY_TAX)/BONDED_TOKENS_RATIO]
   * @param decimal mint decimal
   * @returns Staking APR theoretically
   */
async function stakingAPR(decimal: number): Promise<number> {
    const inflation = await this.inflation(decimal);
    const communityTax = await this.communityTax(decimal);
    const bondedTokensRatio = await this.bondedTokensRatio();
    return (inflation * (1 - communityTax)) / bondedTokensRatio;
}
/**
 * ACTUAL_STAKING_APR = STAKING_APR*[ACTUAL_ANNUAL_PROVISION/ANNUAL_PROVISION]
 * @param decimal mint decimal
 * @returns actual staking APR 
 */
async function actualStakingAPR(decimal: number): Promise<number> {
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
async function finalStakingAPR(
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
test2()

/**
 * function uint8ArrayStringToNumber(
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
 */
