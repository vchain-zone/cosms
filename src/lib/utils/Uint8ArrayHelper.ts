export class Uint8ArrayHelper {
  static toHex(uint8) {
    let hex = Buffer.from(uint8).toString('hex');
    return hex;
  }

}
