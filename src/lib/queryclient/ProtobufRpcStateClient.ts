import { QueryClient } from '@cosmjs/stargate';

import { BatchQueryClient } from './batchqueryclient';

export interface ProtobufRpcStateClient {
  block(height?: number);

  prefixService(prefix?: string);

  request(
    service: string,
    method: string,
    data: Uint8Array
  ): Promise<Uint8Array>;
}

export function createProtobufRpcStateClient(
  base: QueryClient | BatchQueryClient
): ProtobufRpcStateClient {
  const self = {};
  return {
    block(height?: number) {
      self['height'] = height;
      return this;
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
        const i = service.indexOf('.');
        service = self['prefixService'] + service.slice(i, service.length);
      }
      const path = `/${service}/${method}`;
      const height = self['height'];
      self['height'] = undefined;
      // console.debug(` get ${path} at ${height}`);
      // return base.queryUnverified(path, data, height);
      try {
        let res = base.queryUnverified(path, data, height);
        return res;
      } catch (e) {
        const f = new Uint8Array([]);
        return new Promise((resolve) => resolve(f));
      }

    }
  };
}
