import { longify } from "@cosmjs/stargate/build/queryclient";
import Cosm from "@tovchain/cosms";
import { BaseProvider } from "@tovchain/cosms/build/main/lib/providers";
import { App } from "cosmjs-types/tendermint/version/types";
import { buffer } from "stream/consumers";
import Cosmos from "../cosmos";
import APRCalculator from "./index"
async function test() {
    let data: any;
    let rpc = "https://rpc.orai.io";
    let rpc2 = "https://rpc.cosmos.directory/cosmoshub"
    let rpc3 = "https://rpc.cosmos.directory/juno"
    let provider = new BaseProvider();

    await provider.connect(rpc3);

    let cosm = new Cosm(provider);
    let APR = new APRCalculator(cosm.cosmos, provider)
    // let denominator = await cosm.cosmos.mint.query.Params({})
    // console.log(denominator)
    // let estBlockPerYear = (await cosm.cosmos.mint.query.Params({})).params.blocksPerYear.toNumber();


    let validatorAddress = 'cosmosvaloper1c4k24jzduc365kywrsvf5ujz4ya6mwympnc4en'
    // let height = await cosm.provider.batchQueryClient.getHeight();
    // console.log('height: ', height);
    // let blockNow = await cosm.provider.batchQueryClient.getBlock(height);
    // let blockPre = await cosm.provider.batchQueryClient.getBlock(height - estBlockPerYear);
    // console.log(Date.parse(blockNow.header.time))
    // console.log(Date.parse(blockPre.header.time))
    // console.log((Date.parse(blockNow.header.time) - Date.parse(blockPre.header.time)) / estBlockPerYear)
    // console.log(await APR.actualProvisionsRatio())
    // console.log(await APR.actualStakingAPR(18))
    // let estBlocksPerYear = (await cosm.cosmos.mint.query.Params({})).params.blocksPerYear
    // console.log(estBlocksPerYear.toNumber())
    // let estBlockTime = 86400 * 365.25 / (estBlocksPerYear.toNumber());
    // console.log(estBlockTime)
    // // console.log(await APR.annualProvisions(27))
    // console.log(await APR.bondedTokensRatio())
    // console.log(await APR.bondedTokens(0));
    // console.log(await APR.notBondedTokens(0));
    // console.log(await APR.bondedTokens(0) / (await APR.bondedTokens(0) + await APR.notBondedTokens(0)))

    // let data: any = await cosm.cosmos.bank.query.SupplyOf({ denom: "orai" });
    // console.log(await APR.bondedTokensRatio());
    // console.log(await APR.stakingAPR(18))
    /**____________________ */
    // console.log(data)
    // console.log('bondedRatio: ', await APR.bondedTokensRatio())
    // console.log('stakingAPR: ', await APR.stakingAPR(18))
    // data = await cosm.cosmos.distribution.query.ValidatorCommission({ validatorAddress: validatorAddress });
    // console.log(uint8ArrayStringToNumber(data.commission.commission[0].amount, 27))
    // console.log(await APR.finalStakingAPR(validatorAddress, 18, 27))
    // console.log(await APR.stakingAPR(6))
    // console.log('[18]communityTax: ', uint8ArrayStringToNumber(data.params.communityTax, 18))
    // data = await cosm.cosmos.mint.query.Inflation({});
    // console.log('[18]inflation: ', uint8ArrayStringToNumber(data.inflation, 18));
    // data = await cosm.cosmos.mint.query.AnnualProvisions({});
    // console.log('[24]annualProvisions: ', uint8ArrayStringToNumber(data.annualProvisions, 24));
    // data = await cosm.cosmos.staking.query.Pool({});
    // console.log('[6]bondedTokens: ', uint8ArrayStringToNumber(data.pool.bondedTokens, 6));
    // data = await cosm.cosmos.mint.query.Params({});
    // console.log('[]blockPerYear: ', data.params)
    // console.log('denomMetadara: ', await cosm.cosmos.bank.query.DenomMetadata({ denom: 'mint' }))
    // console.log('denomsMetadata: ', await cosm.cosmos.bank.query.DenomsMetadata({}));
    console.log(await (await cosm.cosmos.mint.query.Inflation({})).inflation)
    // console.log(await APR.stakingAPR(18))
    // console.log(await APR.communityTax(18))
    // console.log(await APR.bondedTokensRatio())
    // console.log(await APR.stakingAPR(18))
    // console.log(await APR.actualProvisionsRatio())
    // console.log((await cosm.cosmos.mint.query.Params({})).params.blocksPerYear)
}
test()
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