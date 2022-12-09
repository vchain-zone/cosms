import { JsonObject } from '@cosmjs/cosmwasm-stargate';
import { fromUtf8, toUtf8 } from '@cosmjs/encoding';
import { QueryClientImpl } from 'cosmjs-types/cosmwasm/wasm/v1/query';
import * as MsgClient from 'cosmjs-types/cosmwasm/wasm/v1/tx';
import { MsgClientImpl } from 'cosmjs-types/cosmwasm/wasm/v1/tx';
import * as WasmProtobuf from 'cosmjs-types/cosmwasm/wasm/v1/types';

import { Provider } from '../providers';
import { ProtobufRpcBatchClient } from '../queryclient/ProtobufRpcBatchClient';
import { ProtobufRpcStateClient } from '../queryclient/ProtobufRpcStateClient';

import { App } from './app';


export class Wasm extends App {
  public declare query: QueryClientImpl & ProtobufRpcStateClient;
  public declare queryBatch: QueryClientImpl & ProtobufRpcBatchClient;
  public declare message: MsgClientImpl;
  public protobuf = WasmProtobuf;

  constructor(provider: Provider) {
    super(provider);
    this.setQueryClient(QueryClientImpl);
    this.setMessage(MsgClient);
  }

  async queryContractSmart(address: string, query: JsonObject, height?: number) {
    const request = {
      address: address,
      queryData: toUtf8(JSON.stringify(query))
    };
    if (height) {
      this.query.block(height);
    }
    const { data } = await this.query.SmartContractState(request);
// By convention, smart queries must return a valid JSON document (see https://github.com/CosmWasm/cosmwasm/issues/144)
    let responseText: string;
    try {
      responseText = fromUtf8(data);
    } catch (error) {
      throw new Error(`Could not UTF-8 decode smart query response from contract: ${error}`);
    }
    try {
      return JSON.parse(responseText);
    } catch (error) {
      throw new Error(`Could not JSON parse smart query response from contract: ${error}`);
    }
  }

}
