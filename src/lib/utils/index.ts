import * as crypto from '@cosmjs/crypto';
import * as protoSigning from '@cosmjs/proto-signing';
import { Bech32Helper } from './bench32helper';
import { IBCHelper } from './ibcHelper';

import { Uint8ArrayHelper } from './Uint8ArrayHelper';


export class Utils {
  static crypto = crypto;
  static protoSigning = protoSigning;
  static bech32 = Bech32Helper;
  static uint8Array = Uint8ArrayHelper;
  static IBCHelper = IBCHelper;
}
