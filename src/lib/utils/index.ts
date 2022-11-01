import * as crypto from '@cosmjs/crypto';
import * as protoSigning from '@cosmjs/proto-signing';

import { Uint8ArrayHelper } from './Uint8ArrayHelper';
import { Bech32Helper } from './bench32helper';


export class Utils {
  static crypto = crypto;
  static protoSigning = protoSigning;
  static bech32 = Bech32Helper;
  static uint8Array = Uint8ArrayHelper;
}
