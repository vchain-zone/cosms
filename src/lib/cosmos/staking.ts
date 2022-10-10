import { createPagination } from '@cosmjs/stargate';
import { BondStatusString } from '@cosmjs/stargate/build/modules/staking/queries';
import {
  QueryClientImpl,
  QueryDelegationResponse,
  QueryDelegatorDelegationsResponse,
  QueryDelegatorUnbondingDelegationsResponse,
  QueryDelegatorValidatorResponse,
  QueryDelegatorValidatorsResponse,
  QueryHistoricalInfoResponse,
  QueryParamsResponse,
  QueryPoolResponse,
  QueryRedelegationsResponse,
  QueryUnbondingDelegationResponse,
  QueryValidatorDelegationsResponse,
  QueryValidatorResponse,
  QueryValidatorsResponse,
  QueryValidatorUnbondingDelegationsResponse,
} from 'cosmjs-types/cosmos/staking/v1beta1/query';
import { BondStatus } from 'cosmjs-types/cosmos/staking/v1beta1/staking';
import Long from 'long';

import { provider } from '../providers';
import { createProtobufRpcStateClient } from '../queryclient/utils';

export const ValidatorBondStatus = BondStatus;

export class Staking {
  private _message: any;

  get query(): {
    block: (height: number) => any;
    delegatorDelegations: (
      delegatorAddress: string,
      paginationKey?: Uint8Array
    ) => Promise<QueryDelegatorDelegationsResponse>;
    validators: (
      status: BondStatusString,
      paginationKey?: Uint8Array
    ) => Promise<QueryValidatorsResponse>;
    pool: () => Promise<QueryPoolResponse>;
    redelegations: (
      delegatorAddress: string,
      sourceValidatorAddress: string,
      destinationValidatorAddress: string,
      paginationKey?: Uint8Array
    ) => Promise<QueryRedelegationsResponse>;
    validator: (validatorAddress: string) => Promise<QueryValidatorResponse>;
    delegatorValidator: (
      delegatorAddress: string,
      validatorAddress: string
    ) => Promise<QueryDelegatorValidatorResponse>;
    validatorDelegations: (
      validatorAddress: string,
      paginationKey?: Uint8Array
    ) => Promise<QueryValidatorDelegationsResponse>;
    params: () => Promise<QueryParamsResponse>;
    historicalInfo: (height: number) => Promise<QueryHistoricalInfoResponse>;
    unbondingDelegation: (
      delegatorAddress: string,
      validatorAddress: string
    ) => Promise<QueryUnbondingDelegationResponse>;
    validatorUnbondingDelegations: (
      validatorAddress: string,
      paginationKey?: Uint8Array
    ) => Promise<QueryValidatorUnbondingDelegationsResponse>;
    delegation: (
      delegatorAddress: string,
      validatorAddress: string
    ) => Promise<QueryDelegationResponse>;
    delegatorUnbondingDelegations: (
      delegatorAddress: string,
      paginationKey?: Uint8Array
    ) => Promise<QueryDelegatorUnbondingDelegationsResponse>;
    delegatorValidators: (
      delegatorAddress: string,
      paginationKey?: Uint8Array
    ) => Promise<QueryDelegatorValidatorsResponse>;
  } {
    return this._query;
  }

  private provider: provider;
  private _query: {
    block: (height: number) => any;
    delegatorDelegations: (
      delegatorAddress: string,
      paginationKey?: Uint8Array
    ) => Promise<QueryDelegatorDelegationsResponse>;
    validators: (
      status: BondStatusString,
      paginationKey?: Uint8Array
    ) => Promise<QueryValidatorsResponse>;
    pool: () => Promise<QueryPoolResponse>;
    redelegations: (
      delegatorAddress: string,
      sourceValidatorAddress: string,
      destinationValidatorAddress: string,
      paginationKey?: Uint8Array
    ) => Promise<QueryRedelegationsResponse>;
    validator: (validatorAddress: string) => Promise<QueryValidatorResponse>;
    delegatorValidator: (
      delegatorAddress: string,
      validatorAddress: string
    ) => Promise<QueryDelegatorValidatorResponse>;
    validatorDelegations: (
      validatorAddress: string,
      paginationKey?: Uint8Array
    ) => Promise<QueryValidatorDelegationsResponse>;
    params: () => Promise<QueryParamsResponse>;
    historicalInfo: (height: number) => Promise<QueryHistoricalInfoResponse>;
    unbondingDelegation: (
      delegatorAddress: string,
      validatorAddress: string
    ) => Promise<QueryUnbondingDelegationResponse>;
    validatorUnbondingDelegations: (
      validatorAddress: string,
      paginationKey?: Uint8Array
    ) => Promise<QueryValidatorUnbondingDelegationsResponse>;
    delegation: (
      delegatorAddress: string,
      validatorAddress: string
    ) => Promise<QueryDelegationResponse>;
    delegatorUnbondingDelegations: (
      delegatorAddress: string,
      paginationKey?: Uint8Array
    ) => Promise<QueryDelegatorUnbondingDelegationsResponse>;
    delegatorValidators: (
      delegatorAddress: string,
      paginationKey?: Uint8Array
    ) => Promise<QueryDelegatorValidatorsResponse>;
  };

  constructor(provider: provider) {
    this.provider = provider;
    this._query = this.setupStakingQuery();
    this._message = {};
  }

  setupStakingQuery = () => {
    const rpc = createProtobufRpcStateClient(
      this.provider.batchQueryClient.getQueryClient()
    );
    const queryService = new QueryClientImpl(rpc);

    return {
      block: rpc.block,
      delegation: async (
        delegatorAddress: string,
        validatorAddress: string
      ) => {
        const response = await queryService.Delegation({
          delegatorAddr: delegatorAddress,
          validatorAddr: validatorAddress,
        });
        return response;
      },
      delegatorDelegations: async (
        delegatorAddress: string,
        paginationKey?: Uint8Array
      ) => {
        const response = await queryService.DelegatorDelegations({
          delegatorAddr: delegatorAddress,
          pagination: createPagination(paginationKey),
        });
        return response;
      },
      delegatorUnbondingDelegations: async (
        delegatorAddress: string,
        paginationKey?: Uint8Array
      ) => {
        const response = await queryService.DelegatorUnbondingDelegations({
          delegatorAddr: delegatorAddress,
          pagination: createPagination(paginationKey),
        });
        return response;
      },
      delegatorValidator: async (
        delegatorAddress: string,
        validatorAddress: string
      ) => {
        const response = await queryService.DelegatorValidator({
          delegatorAddr: delegatorAddress,
          validatorAddr: validatorAddress,
        });
        return response;
      },
      delegatorValidators: async (
        delegatorAddress: string,
        paginationKey?: Uint8Array
      ) => {
        const response = await queryService.DelegatorValidators({
          delegatorAddr: delegatorAddress,
          pagination: createPagination(paginationKey),
        });
        return response;
      },
      historicalInfo: async (height: number) => {
        const response = await queryService.HistoricalInfo({
          height: Long.fromNumber(height, true),
        });
        return response;
      },
      params: async () => {
        const response = await queryService.Params({});
        return response;
      },
      pool: async () => {
        const response = await queryService.Pool({});
        return response;
      },
      redelegations: async (
        delegatorAddress: string,
        sourceValidatorAddress: string,
        destinationValidatorAddress: string,
        paginationKey?: Uint8Array
      ) => {
        const response = await queryService.Redelegations({
          delegatorAddr: delegatorAddress,
          srcValidatorAddr: sourceValidatorAddress,
          dstValidatorAddr: destinationValidatorAddress,
          pagination: createPagination(paginationKey),
        });
        return response;
      },
      unbondingDelegation: async (
        delegatorAddress: string,
        validatorAddress: string
      ) => {
        const response = await queryService.UnbondingDelegation({
          delegatorAddr: delegatorAddress,
          validatorAddr: validatorAddress,
        });
        return response;
      },
      validator: async (validatorAddress: string) => {
        const response = await queryService.Validator({
          validatorAddr: validatorAddress,
        });
        return response;
      },
      validatorDelegations: async (
        validatorAddress: string,
        paginationKey?: Uint8Array
      ) => {
        const response = await queryService.ValidatorDelegations({
          validatorAddr: validatorAddress,
          pagination: createPagination(paginationKey),
        });
        return response;
      },
      validators: async (
        status: BondStatusString = 'BOND_STATUS_BONDED',
        paginationKey?: Uint8Array
      ) => {
        const response = await queryService.Validators({
          status: status,
          pagination: createPagination(paginationKey),
        });
        return response;
      },
      validatorUnbondingDelegations: async (
        validatorAddress: string,
        paginationKey?: Uint8Array
      ) => {
        const response = await queryService.ValidatorUnbondingDelegations({
          validatorAddr: validatorAddress,
          pagination: createPagination(paginationKey),
        });
        return response;
      },
    };
  };
}
