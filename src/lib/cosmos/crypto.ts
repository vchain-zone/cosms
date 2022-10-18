import { Provider } from '../providers';

import { App } from './app';

export class Crypto extends App {
  constructor(provider: Provider) {
    super(provider);
  }
}
