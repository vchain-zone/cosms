import { provider } from '../providers';

export class Wasm {
  private provider: provider;

  constructor(provider: provider) {
    this.provider = provider;
  }
}
