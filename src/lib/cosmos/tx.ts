import { Registry } from '@cosmjs/proto-signing';
import { defaultRegistryTypes } from '@cosmjs/stargate';
import { ServiceClientImpl } from 'cosmjs-types/cosmos/tx/v1beta1/service';

import { Provider } from '../providers';

import { App } from './app';

export class Tx extends App {
  public declare query: ServiceClientImpl;
  public declare registry: Registry;

  constructor(provider: Provider) {
    super(provider);
    this.setQueryClient(ServiceClientImpl);
    this.registry = new Registry(defaultRegistryTypes);
  }
}
