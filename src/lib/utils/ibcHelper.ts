import sha256 from 'crypto-js/sha256';

function toIBCDenom(baseDenom, path) {
  return 'ibc/' + sha256(`${path}/${baseDenom}`);
}

export const IBCHelper = {
  toIBCDenom
};
