import Cosm from "../cosm";
import { BaseProvider } from "../providers";

async function test3() {
    let rpc = "https://rpc.orai.io"
    let provider = new BaseProvider();
    await provider.connect(rpc);
    let cosm = new Cosm(provider)
    console.log(await cosm.calculator.stakingAPR(18))
    console.log(await cosm.calculator.stakingAPY(await cosm.calculator.stakingAPR(18)))
    console.log(await cosm.calculator.stakingAPY(await cosm.calculator.stakingAPR(18), 365))
}
test3()