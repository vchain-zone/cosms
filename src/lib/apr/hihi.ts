import Cosm from "../cosm";
import { BaseProvider } from "../providers";

async function test3() {
    let rpc = "https://rpc.orai.io"
    let provider = new BaseProvider();
    await provider.connect(rpc);
    let cosm = new Cosm(provider)
    let validatorAddress = 'oraivaloper1mxqeldsxg60t2y6gngpdm5jf3k96dnju5el96f'
    let data = await cosm.cosmos.staking.query.Validator({ validatorAddr: validatorAddress })
    console.log(data.validator.commission.commissionRates.rate)
    console.log(await cosm.calculator.validatorCommission(validatorAddress, 18))
  
  let apr = await cosm.calculator.stakingAPR(18)
  console.log(apr);
}
test3()
