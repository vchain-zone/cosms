import { JsonRpcId } from '@cosmjs/json-rpc/build/types';

import { BatchQueryClient } from './batchqueryclient';


export interface ProtobufRpcBatchClient {
  base: BatchQueryClient,

  setId(id: JsonRpcId): this;

  block(height?: number): this;

  prefixService(prefix?: string): this;

  request(
    service: string,
    method: string,
    data: Uint8Array
  ): Promise<Uint8Array>;
}

export function createProtobufRpcBatchClient(
  base: BatchQueryClient
): ProtobufRpcBatchClient {
  const self = {};
  return {
    base: base,
    setId(id: JsonRpcId) {
      self['requestId'] = id;
      return this;
    },
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
      const id = self['requestId'];
      self['requestId'] = undefined;
      // console.debug(` get ${path} at ${height}`);
      // return base.queryUnverified(path, data, height);
      try {
        let res = base.queryUnverified(path, data, height, id);
        return res;
      } catch (e) {
        const f = new Uint8Array([]);
        return new Promise((resolve) => resolve(f));
      }

    }
  };
}
