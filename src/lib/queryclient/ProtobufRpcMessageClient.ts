import { StdFee } from '@cosmjs/amino';
import { DeliverTxResponse, QueryClient } from '@cosmjs/stargate';
import _m0 from 'protobufjs/minimal';

export interface ProtobufRpcMessageClient {
  currentMessage(): any;

  send(wallet, fee: StdFee | 'auto' | number, memo?: string): Promise<DeliverTxResponse>;

  prefixService(prefix?: string);

  request(
    service: string,
    method: string,
    data: Uint8Array
  ): Promise<Uint8Array>;
}

export function createProtobufRpcMessageClient(
  base: QueryClient,
  messageProtobuf
): ProtobufRpcMessageClient {
  const self = {};
  return {
    currentMessage() {
      return self['currentMessage'];
    },
    async send(wallet, fee: StdFee | 'auto' | number, memo?: string): Promise<DeliverTxResponse> {
      const msgAny = self['currentMessage'];
      const address = wallet.address;
      const result = wallet.stargateSigner.signAndBroadcast(address, [msgAny], fee, memo);
      return result;
    },
    prefixService(prefix?) {
      self['prefixService'] = prefix;
      return this;
    },
    request: (
      service: string,
      method: string,
      data: Uint8Array
    ): Promise<Uint8Array> => {
      if (self['prefixService']) {
        let i = service.indexOf('.');
        service = self['prefixService'] + service.slice(i, service.length);
      }
      const typeUrl = `/${service}${method}`;

      let i = typeUrl.lastIndexOf('.');
      const msgName = typeUrl.slice(i + 1, typeUrl.length);

      const msgData = messageProtobuf[msgName].decode(new _m0.Reader(data));

      self['currentMessage'] = {
        typeUrl: typeUrl,
        value: msgData
      };

      // console.debug(` get ${path} at ${height}`);
      const f = new Uint8Array([]);
      return new Promise((resolve => resolve(f)));
    }
  };
}
