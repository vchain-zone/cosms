import {
  AminoSignResponse,
  Secp256k1HdWallet,
  Secp256k1HdWalletOptions,
  StdSignDoc,
} from '@cosmjs/amino';
import { Bip39, EnglishMnemonic, Random } from '@cosmjs/crypto';
import { toBech32 } from '@cosmjs/encoding';
import { coins } from '@cosmjs/proto-signing';
import {
  calculateFee,
  GasPrice,
  SigningStargateClientOptions,
} from '@cosmjs/stargate';

export function simapp44Enabled(): boolean {
  return !!process.env.SIMAPP44_ENABLED;
}

export function simapp46Enabled(): boolean {
  return !!process.env.SIMAPP46_ENABLED;
}

export function simappEnabled(): boolean {
  return simapp44Enabled() || simapp46Enabled();
}

export function pending(message: string) {
  console.log(message);
  return;
}

export function pendingWithoutSimapp44Or46(): void {
  if (!simapp44Enabled() && !simapp46Enabled()) {
    return pending('Set SIMAPP{44,46}_ENABLED to enable Simapp based tests');
  }
}

export function pendingWithoutSimapp46(): void {
  if (!simapp46Enabled()) {
    return pending('Set SIMAPP46_ENABLED to enable Simapp based tests');
  }
}

export function pendingWithoutSimapp(): void {
  if (!simappEnabled()) {
    return pending('Set SIMAPP{44,46}_ENABLED to enable Simapp based tests');
  }
}

export function slowSimappEnabled(): boolean {
  return (
    !!process.env.SLOW_SIMAPP44_ENABLED || !!process.env.SLOW_SIMAPP46_ENABLED
  );
}

export function pendingWithoutSlowSimapp(): void {
  if (!slowSimappEnabled()) {
    return pending(
      'Set SLOW_SIMAPP{44,46}_ENABLED to enable slow Simapp based tests'
    );
  }
}

export function makeRandomAddressBytes(): Uint8Array {
  return Random.getBytes(20);
}

export function makeRandomAddress(): string {
  return toBech32('cosmos', makeRandomAddressBytes());
}

/** Returns first element. Throws if array has a different length than 1. */
export function fromOneElementArray<T>(elements: ArrayLike<T>): T {
  if (elements.length !== 1)
    throw new Error(`Expected exactly one element but got ${elements.length}`);
  return elements[0];
}

export const defaultGasPrice = GasPrice.fromString('0.025ucosm');
export const defaultSendFee = calculateFee(100_000, defaultGasPrice);

export const simapp = {
  tendermintUrl: 'localhost:26658',
  tendermintUrlWs: 'ws://localhost:26658',
  tendermintUrlHttp: 'http://localhost:26658',
  chainId: 'simd-testing',
  denomStaking: 'ustake',
  denomFee: 'ucosm',
  blockTime: 1_000, // ms
  totalSupply: 21000000000, // ucosm
  govMinDeposit: coins(10000000, 'ustake'),
};

export const slowSimapp = {
  tendermintUrl: 'localhost:26660',
  tendermintUrlWs: 'ws://localhost:26660',
  tendermintUrlHttp: 'http://localhost:26660',
  chainId: 'simd-testing',
  denomStaking: 'ustake',
  denomFee: 'ucosm',
  blockTime: 10_000, // ms
  totalSupply: 21000000000, // ucosm
};

/** Setting to speed up testing */
export const defaultSigningClientOptions: SigningStargateClientOptions = {
  broadcastPollIntervalMs: 300,
  broadcastTimeoutMs: 8_000,
  gasPrice: GasPrice.fromString('0.01ucosm'),
};

export const defaultAccount = {
  mnemonic:
    'river art invite misery warm input decorate marriage grace already cabbage scout churn cart country laptop supreme pipe divide metal path same replace gather',
};
export const faucet = {
  mnemonic:
    'economy stock theory fatal elder harbor betray wasp final emotion task crumble siren bottom lizard educate guess current outdoor pair theory focus wife stone',
  pubkey0: {
    type: 'tendermint/PubKeySecp256k1',
    value: 'A08EGB7ro1ORuFhjOnZcSgwYlpe0DSFjVNUIkNNQxwKQ',
  },
  pubkey1: {
    type: 'tendermint/PubKeySecp256k1',
    value: 'AiDosfIbBi54XJ1QjCeApumcy/FjdtF+YhywPf3DKTx7',
  },
  pubkey2: {
    type: 'tendermint/PubKeySecp256k1',
    value: 'AzQg33JZqH7vSsm09esZY5bZvmzYwE/SY78cA0iLxpD7',
  },
  pubkey3: {
    type: 'tendermint/PubKeySecp256k1',
    value: 'A3gOAlB6aiRTCPvWMQg2+ZbGYNsLd8qlvV28m8p2UhY2',
  },
  pubkey4: {
    type: 'tendermint/PubKeySecp256k1',
    value: 'Aum2063ub/ErUnIUB36sK55LktGUStgcbSiaAnL1wadu',
  },
  address0: 'cosmos1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6',
  address1: 'cosmos10dyr9899g6t0pelew4nvf4j5c3jcgv0r73qga5',
  address2: 'cosmos1xy4yqngt0nlkdcenxymg8tenrghmek4nmqm28k',
  address3: 'cosmos142u9fgcjdlycfcez3lw8x6x5h7rfjlnfhpw2lx',
  address4: 'cosmos1hsm76p4ahyhl5yh3ve9ur49r5kemhp2r0dcjvx',
};

/** Unused account */
export const unused = {
  pubkey: {
    type: 'tendermint/PubKeySecp256k1',
    value: 'ArkCaFUJ/IH+vKBmNRCdUVl3mCAhbopk9jjW4Ko4OfRQ',
  },
  address: 'cosmos1cjsxept9rkggzxztslae9ndgpdyt2408lk850u',
  accountNumber: 16,
  sequence: 0,
  balanceStaking: '2000000000', // 2000 STAKE
  balanceFee: '1000000000', // 1000 COSM
};

export const validator = {
  /**
   * From first gentx's auth_info.signer_infos in scripts/simapp44/template/.simapp/config/genesis.json
   *
   * ```
   * jq ".app_state.genutil.gen_txs[0].auth_info.signer_infos[0].public_key" scripts/simapp44/template/.simapp/config/genesis.json
   * ```
   */
  pubkey: {
    type: 'tendermint/PubKeySecp256k1',
    value: 'AtDcuH4cX1eaxZrJ5shheLG3tXPAoV4awoIZmNQtQxmf',
  },
  /**
   * delegator_address from /cosmos.staking.v1beta1.MsgCreateValidator in scripts/simapp44/template/.simapp/config/genesis.json
   *
   * ```
   * jq ".app_state.genutil.gen_txs[0].body.messages[0].delegator_address" scripts/simapp44/template/.simapp/config/genesis.json
   * ```
   */
  delegatorAddress: 'cosmos1urk9gy7cfws0ak9x5nu7lx4un9n6gqkry79679',
  /**
   * validator_address from /cosmos.staking.v1beta1.MsgCreateValidator in scripts/simapp44/template/.simapp/config/genesis.json
   *
   * ```
   * jq ".app_state.genutil.gen_txs[0].body.messages[0].validator_address" scripts/simapp44/template/.simapp/config/genesis.json
   * ```
   */
  validatorAddress: 'cosmosvaloper1urk9gy7cfws0ak9x5nu7lx4un9n6gqkrp230jk',
  accountNumber: 0,
  sequence: 1,
};

export const nonExistentAddress =
  'cosmos1p79apjaufyphcmsn4g07cynqf0wyjuezqu84hd';

export const nonNegativeIntegerMatcher = /^[0-9]+$/;
export const tendermintIdMatcher = /^[0-9A-F]{64}$/;

/**
 * A class for testing clients using an Amino signer which modifies the transaction it receives before signing
 */
export class ModifyingSecp256k1HdWallet extends Secp256k1HdWallet {
  public static override async fromMnemonic(
    mnemonic: string,
    options: Partial<Secp256k1HdWalletOptions> = {}
  ): Promise<ModifyingSecp256k1HdWallet> {
    const mnemonicChecked = new EnglishMnemonic(mnemonic);
    const seed = await Bip39.mnemonicToSeed(
      mnemonicChecked,
      options.bip39Password
    );
    return new ModifyingSecp256k1HdWallet(mnemonicChecked, {
      ...options,
      seed: seed,
    });
  }

  public override async signAmino(
    signerAddress: string,
    signDoc: StdSignDoc
  ): Promise<AminoSignResponse> {
    const modifiedSignDoc = {
      ...signDoc,
      fee: {
        amount: coins(3000, 'ucosm'),
        gas: '333333',
      },
      memo: 'This was modified',
    };
    return super.signAmino(signerAddress, modifiedSignDoc);
  }
}
