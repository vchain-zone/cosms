import { commonOperations } from "@bitauth/libauth";
import { cosmjsSalt } from "@cosmjs/amino/build/wallet";
import { Result } from "cosmjs-types/cosmos/base/abci/v1beta1/abci";
import Cosm from "../cosm";
import { BaseProvider } from "../providers"
type RPC = {
    [key: string]: string
};
type ChainAPR = {
    key: string,
    stakingAPR: number,
    actualStakingAPR: number,
    inflation: number,
}
async function main() {
    let rpc: RPC = {
        'Orai': 'https://rpc.orai.io/',
        'Juno': 'https://juno.rpc.stakin.com',
        'Emoney': 'https://emoney.validator.network',
        'Evmos': 'https://rpc.evmos.tcnetwork.io',
        'Stargaze': 'https://stargaze.c29r3.xyz:443/rpc/',
        'IOX': '',
        'Kava': 'https://kava-rpc.polkachu.com',
        'Secret': 'https://rpc.scrt.network',
        'Regen': 'https://rpc-regen.ecostake.com',
        'Omniflix': 'https://omniflix-rpc.lavenderfive.com/',
        'Likecoin': 'https://mainnet-node.like.co/rpc/',
        'Kichain': '',
        'Cheq': 'https://rpc.cheqd.net',
        'Band': 'https://band-rpc.ibs.team/',
        'Chihuahua': 'https://rpc.chihuahua.wtf/',
        'Konstellation': 'https://konstellation-rpc.lavenderfive.com/',
        'Vidulum': 'https://mainnet-rpc.vidulum.app/',
        'Provenance': 'https://rpc.provenance.io/',
        'Bitcanna': 'http://bcna.paranorm.pro/',
        'Fetch.Ai': 'https://rpc-fetchhub.fetch.ai:443',
        'Umee': 'https://umee-rpc.polkachu.com',
        'Injective': 'https://injective-rpc.quickapi.com:443',
        'Passage': 'https://passage-rpc.polkachu.com',
        'Starname': 'https://starname.nodejumper.io/',
        'Akash': 'https://rpc-akash.ecostake.com:443',
        'Sifchain': 'https://rpc-archive.sifchain.finance:443',
        'Sentinel': 'https://rpc.sentinel.freak12techno.io/',
        'Agoric': 'https://agoric-rpc.polkachu.com',
        'AIOZ': 'https://rpc-dataseed.aioz.network:443',
        'Arkh': 'https://asc-dataseed.arkhadian.com/',
        'AssetMantle': 'https://rpc.assetmantle.one/',
        'Axelar': 'https://axelar-rpc.polkachu.com',
        'BeeZee': 'https://rpc-1.getbze.com',
        'BitSong': 'https://rpc.bitsong.interbloc.org',
        'bostrom': 'https://rpc.bostrom.cybernode.ai',
        'Canto': 'https://rpc.canto.silentvalidator.com/',
        'Carbon': 'https://rpc.carbon.bh.rocks',
        'Comdex': 'https://rpc-comdex.zenchainlabs.io/',
        'Commercio': 'https://rpc-mainnet.commercio.network',
        'Crescent': 'https://mainnet.crescent.network:26657',
        'Cronos': 'https://rpc.cronos.org/',
        'Crypto': 'https://rpc-cryptoorgchain-ia.cosmosia.notional.ventures/',
        'Cudos': 'http://mainnet-full-node-01.hosts.cudos.org:26657',
        'Decentr': 'https://ares.mainnet.decentr.xyz',
        'Desmos': 'https://rpc.mainnet.desmos.network',
        'Echelon': 'https://rpc.eu.ech.world',
        'Ethos': 'https://ethos-rpc.provable.dev:443/',
        'FirmaChain': 'https://rpc.firmachain.chaintools.tech/',
        'Galaxy': 'https://galaxy-rpc.lavenderfive.com/',
        'GenesisL1': 'https://26657.genesisl1.org',
        'Gravity': 'http://gravity-bridge-1-08.nodes.amhost.net:26657',
        'IDEP': 'https://idep-rpc.lavenderfive.com/',
        'Impact': 'https://rpc-ixo-ia.cosmosia.notional.ventures/',
        'IRISnet': 'https://rpc-irisnet-ia.cosmosia.notional.ventures/',
        'Kujira': 'https://rpc-kujira.ecostake.com',
        'Lambda': 'https://rpc.lambda.nodestake.top',
        'Logos': 'https://logos-rpc.provable.dev:443/',
        'LumenX': 'https://rpc.helios-1.lumenex.io',
        'Lum': 'https://node0.mainnet.lum.network/rpc',
        'MEME': 'https://rpc.meme.interbloc.org/',
        'Mythos': 'https://mythos-rpc.provable.dev:443/',
        'Nomic': 'https://rpc.nomic.interbloc.org',
        'Odin': 'http://34.79.179.216:26657',
        'OKExChain': 'https://exchaintmrpc.okex.org',
        'Osmosis': 'https://rpc.osmosis.interbloc.org',
        'Medibloc': 'https://rpc.gopanacea.org',
        'Persistence': 'https://rpc-persistence.starsquid.io',
        'Point': 'https://rpc-mainnet-1.point.space:26657',
        'Rebus': 'https://rpc-1.rebus.nodes.guru',
        'Rizon': 'https://rizon.nodejumper.io',
        'Shentu': 'https://shentu-rpc.panthea.eu',
        'Sommelier': 'https://rpc.sommelier.pupmos.network',
        'Stride': 'https://rpc.stride.bh.rocks',
        'Teritori': 'https://teritori-rpc.lavenderfive.com:443',
        'Terra': 'https://terra-rpc.easy2stake.com:443',
        'Terra2': 'https://terra-rpc.polkachu.com',
        'Tgrade': 'https://rpc.tgrade.posthuman.digital',
        'THORChain': 'https://rpc.thorchain.info',
        'Unification': 'https://rpc.unification.chainmasters.ninja/',
    }
    let result: ChainAPR[] = [];
    for (const key in rpc) {
        let chainAPR: ChainAPR;
        let provider;
        let cosm;
        let stakingAPR;
        let actualStakingAPR;
        let inflation;
        let err = undefined;
        provider = new BaseProvider();
        if (rpc[key] == '') {
            continue;
        }
        try {
            await provider.connect(rpc[key]);
            cosm = new Cosm(provider)
            let x = await (await cosm.calculator.inflation(18)).toFixed(2);
        } catch (error) {
            console.log(`${key} bad response`)
            err = error;
        }
        if (err === undefined) {
            let inflation = parseFloat((await cosm.calculator.inflation(18)).toFixed(4)) * 100;
            let stakingAPR = parseFloat((await cosm.calculator.stakingAPR(18)).toFixed(4)) * 100;
            let actualStakingAPR = parseFloat((await cosm.calculator.actualStakingAPR(18)).toFixed(4)) * 100;
            chainAPR = { key, stakingAPR, actualStakingAPR, inflation };
            result.push(chainAPR)
            console.log(`${key} done`)
        }
        err = undefined;
    }
    return result
}
async function test() {
    let result = await main()
    result = result.sort(metric)
    Print(result);

}
function metric(a: ChainAPR, b: ChainAPR): number {
    return (a.stakingAPR >= b.stakingAPR) ? -1 : 1;
}
function Print(r: ChainAPR[]) {
    r.forEach(element => {
        console.log(`${element.key} \t \t ${element.stakingAPR}% \t ${element.actualStakingAPR}% \t ${element.inflation}%`);
    });

}
test()
