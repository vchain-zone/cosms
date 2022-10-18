import { Provider } from '../providers';

export class Wasm {
  private provider: Provider;

  constructor(provider: Provider) {
    this.provider = provider;
  }
}
