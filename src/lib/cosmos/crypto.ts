import { provider } from '../providers';

import { App } from './app';

export class Crypto extends App {
  constructor(provider: provider) {
    super(provider);
  }
}
