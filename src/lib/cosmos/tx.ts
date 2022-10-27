import { Provider } from '../providers';

import { App } from './app';

export class Tx extends App {
  constructor(provider: Provider) {
    super(provider);
  }
}
