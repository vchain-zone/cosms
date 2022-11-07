import { QueryClientImpl } from 'cosmjs-types/cosmos/staking/v1beta1/query';
import * as StakingProtobuf from 'cosmjs-types/cosmos/staking/v1beta1/staking';
import { BondStatus } from 'cosmjs-types/cosmos/staking/v1beta1/staking';
import * as MsgClient from 'cosmjs-types/cosmos/staking/v1beta1/tx';
import { MsgClientImpl } from 'cosmjs-types/cosmos/staking/v1beta1/tx';

import { Provider } from '../providers';
import { ProtobufRpcBatchClient } from '../queryclient/ProtobufRpcBatchClient';
import { ProtobufRpcStateClient } from '../queryclient/ProtobufRpcStateClient';

import { App } from './app';

export const ValidatorBondStatus = BondStatus;

export class Staking extends App {
  public declare query: QueryClientImpl & ProtobufRpcStateClient;
  public declare queryBatch: QueryClientImpl & ProtobufRpcBatchClient;
  public declare message: MsgClientImpl;
  public protobuf = StakingProtobuf;

  constructor(provider: Provider) {
    super(provider);
    this.setQueryClient(QueryClientImpl);
    this.setMessage(MsgClient);
  }
}
