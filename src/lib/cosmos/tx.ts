import { provider } from '../providers';

import { App } from './app';

export class Tx extends App {
  constructor(provider: provider) {
    super(provider);
  }

}
