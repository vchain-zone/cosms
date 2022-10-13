import { QueryClientImpl } from 'cosmjs-types/cosmos/staking/v1beta1/query';
import * as StakingProtobuf from 'cosmjs-types/cosmos/staking/v1beta1/staking';
import { BondStatus } from 'cosmjs-types/cosmos/staking/v1beta1/staking';

import { provider } from '../providers';

import { App } from './app';

export const ValidatorBondStatus = BondStatus;

export class Staking extends App {
  public declare query: QueryClientImpl;
  public protobuf = StakingProtobuf;

  constructor(provider: provider) {
    super(provider);
    this.setQueryClient(QueryClientImpl);
  }
}
