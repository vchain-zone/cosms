import { Provider } from '../providers';
import {ServiceClientImpl} from "cosmjs-types/cosmos/tx/v1beta1/service"
import { App } from './app';

export class Tx extends App {
  query :ServiceClientImpl;
  constructor(provider: Provider) {
    super(provider);
    this.setQueryClient(ServiceClientImpl)
  }
}
