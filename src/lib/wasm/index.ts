import {
    ExecuteInstruction,
    ExecuteResult,
    InstantiateOptions,
    InstantiateResult,
    JsonObject,
    MigrateResult,
    UploadResult,
} from '@cosmjs/cosmwasm-stargate';
import { Coin, OfflineSigner } from '@cosmjs/proto-signing';
import {
    calculateFee,
    DeliverTxResponse,
    GasPrice,
    StdFee,
} from '@cosmjs/stargate';

import { Wallet } from '../wallet';

const defaultUploadGas = 2500000;
const defaultInitGas = 1000000;
const defaultExecGas = 500000;
const defaultGasPrice = 0.25;

export { Coin, OfflineSigner, InstantiateOptions };
export interface InstantiateMessage {
    readonly codeId: number;
    readonly instantiateMsg: JsonObject;
    readonly label: string;
    readonly options?: InstantiateOptions;
}

export interface ExecuteMessage {
    readonly contractAddr: string;
    readonly executeMsg: JsonObject;
    readonly funds?: readonly Coin[];
}

export interface MigrateMessage {
    readonly contractAddr: string;
    readonly migrateMsg: JsonObject;
    readonly codeId: number;
}
export interface QueryMessage {
    readonly contractAddr: string;
    readonly queryMsg: JsonObject;
}

export interface SendMessage {
    readonly recipient: string;
    readonly coins: readonly Coin[];
}

export interface DelegateMessage {
    readonly validator: string;
    readonly coin: Coin;
}

export interface UndelegateMessage {
    readonly validator: string;
    readonly coin: Coin;
}

export class Wasm {
    private wallet: Wallet;

    constructor(wallet: Wallet) {
        this.wallet = wallet;
    }

    public async uploadWasm(
        wasmCode: Uint8Array,
        uploadFee?: StdFee,
        memo?: string
    ): Promise<UploadResult> {
        uploadFee =
            uploadFee == null
                ? this.getFee(defaultUploadGas, defaultGasPrice)
                : uploadFee;
        return await this.wallet.cosmWasmSigner.upload(
            this.wallet.address,
            wasmCode,
            uploadFee,
            memo
        );
    }

    public async initContract(
        instantiateMessage: InstantiateMessage,
        initFee?: StdFee
    ): Promise<InstantiateResult> {
        initFee =
            initFee == null ? this.getFee(defaultInitGas, defaultGasPrice) : initFee;
        return await this.wallet.cosmWasmSigner.instantiate(
            this.wallet.address,
            instantiateMessage.codeId,
            instantiateMessage.instantiateMsg,
            instantiateMessage.label,
            initFee,
            instantiateMessage.options
        );
    }

    public async execute(
        executeMessage: ExecuteMessage,
        memo?: string,
        executeFee?: StdFee
    ): Promise<ExecuteResult> {
        executeFee =
            executeFee == null
                ? this.getFee(defaultExecGas, defaultGasPrice)
                : executeFee;
        return await this.wallet.cosmWasmSigner.execute(
            this.wallet.address,
            executeMessage.contractAddr,
            executeMessage.executeMsg,
            executeFee,
            memo,
            executeMessage.funds
        );
    }

    public async executeMultiple(
        executeMessages: ExecuteMessage[],
        memo?: string,
        executeFee?: StdFee
    ): Promise<ExecuteResult> {
        executeFee =
            executeFee == null
                ? this.getFee(defaultExecGas, defaultGasPrice)
                : executeFee;

        let executeInstructions: ExecuteInstruction[];
        for (let i = 0; i < executeMessages.length; i++) {
            const item: ExecuteInstruction = {
                contractAddress: executeMessages[i].contractAddr,
                msg: executeMessages[i].executeMsg,
                funds: executeMessages[i].funds,
            };
            executeInstructions.push(item);
        }
        return await this.wallet.cosmWasmSigner.executeMultiple(
            this.wallet.address,
            executeInstructions,
            executeFee,
            memo
        );
    }

    public async migrate(
        migrateMessage: MigrateMessage,
        memo?: string,
        migrateFee?: StdFee
    ): Promise<MigrateResult> {
        migrateFee =
            migrateFee == null
                ? this.getFee(defaultExecGas, defaultGasPrice)
                : migrateFee;
        return await this.wallet.cosmWasmSigner.migrate(
            this.wallet.address,
            migrateMessage.contractAddr,
            migrateMessage.codeId,
            migrateMessage.migrateMsg,
            migrateFee,
            memo
        );
    }

    public async query(queryMessage: QueryMessage): Promise<JsonObject> {
        return await this.wallet.cosmWasmSigner.queryContractSmart(
            queryMessage.contractAddr,
            queryMessage.queryMsg
        );
    }

    public async send(
        sendMessage: SendMessage,
        memo?: string,
        sendFee?: StdFee
    ): Promise<DeliverTxResponse> {
        sendFee =
            sendFee == null ? this.getFee(defaultExecGas, defaultGasPrice) : sendFee;
        return await this.wallet.stargateSigner.sendTokens(
            this.wallet.address,
            sendMessage.recipient,
            sendMessage.coins,
            sendFee,
            memo
        );
    }

    public async delegate(
        delegateMessage: DelegateMessage,
        memo?: string,
        delegateFee?: StdFee
    ): Promise<DeliverTxResponse> {
        delegateFee =
            delegateFee == null
                ? this.getFee(defaultExecGas, defaultGasPrice)
                : delegateFee;

        return await this.wallet.stargateSigner.delegateTokens(
            this.wallet.address,
            delegateMessage.validator,
            delegateMessage.coin,
            delegateFee,
            memo
        );
    }

    public async undelegate(
        undelegateMessage: UndelegateMessage,
        memo?: string,
        undelegateFee?: StdFee
    ): Promise<DeliverTxResponse> {
        undelegateFee =
            undelegateFee == null
                ? this.getFee(defaultExecGas, defaultGasPrice)
                : undelegateFee;

        return await this.wallet.stargateSigner.delegateTokens(
            this.wallet.address,
            undelegateMessage.validator,
            undelegateMessage.coin,
            undelegateFee,
            memo
        );
    }

    public async withdrawRewards(
        validatorAddress: string,
        memo?: string,
        withdrawFee?: StdFee
    ) {
        withdrawFee =
            withdrawFee == null
                ? this.getFee(defaultExecGas, defaultGasPrice)
                : withdrawFee;
        return await this.wallet.stargateSigner.withdrawRewards(
            this.wallet.address,
            validatorAddress,
            withdrawFee,
            memo
        );
    }

    public getFee(gas: number, gasPrice: number): StdFee {
        return calculateFee(
            gas,
            GasPrice.fromString(gasPrice.toString() + this.wallet.provider.feeToken)
        );
    }
}
