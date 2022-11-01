import bech32 from 'bech32';
import {
  isValidChecksumAddress,
  stripHexPrefix,
  toChecksumAddress
} from 'crypto-addr-codec';


const { encode, decode, toWords, fromWords } = bech32;

function hexEncoder() {
  return (data) => toChecksumAddress(data.toString('hex'));
}

function hexDecoder() {
  return (data) => {
    const stripped = stripHexPrefix(data);

    if (
      !isValidChecksumAddress(data) &&
      stripped !== stripped.toLowerCase() &&
      stripped !== stripped.toUpperCase()
    ) {
      throw Error('Invalid address checksum');
    }

    return Buffer.from(stripHexPrefix(data), 'hex');
  };
}

function bech32Encoder(prefix) {
  return (data) => encode(prefix, toWords(data));
}

function bech32Decoder(currPrefix) {
  return (data) => {
    const { prefix, words } = decode(data);

    if (prefix !== currPrefix) {
      throw Error('Invalid address format');
    }

    return Buffer.from(fromWords(words));
  };
}

function hexConverter() {
  return {
    decoder: hexDecoder(),
    encoder: hexEncoder()
  };
}

function bech32Convert(prefix) {
  return {
    decoder: bech32Decoder(prefix),
    encoder: bech32Encoder(prefix)
  };
}

function converter(prefix) {
  return {
    toHex: (address) => hexConverter().encoder(bech32Convert(prefix).decoder(address)),
    toBech32: (address) => bech32Convert(prefix).encoder(hexConverter().decoder(address))
  };
}

function toHex(address: string) {
  const i = address.indexOf('1');
  const prefix = address.slice(0, i);
  const hexAddress = converter(prefix).toHex(address);
  return hexAddress;
}

function toBech32(prefix, address) {
  return converter(prefix).toBech32(address);
}

function fromBytes(prefix, bytes: ArrayLike<number>) {
  return bech32.encode(prefix, toWords(bytes));
}

export const Bech32Helper = {
  converter,
  toHex,
  toBech32,
  fromBytes
};
