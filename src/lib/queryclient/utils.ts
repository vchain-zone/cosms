import { QueryClient } from '@cosmjs/stargate';

export interface ProtobufRpcStateClient {
  block(height?: number);

  request(
    service: string,
    method: string,
    data: Uint8Array
  ): Promise<Uint8Array>;
}

export function createProtobufRpcStateClient(
  base: QueryClient
): ProtobufRpcStateClient {
  const self = {};
  return {
    block(height?: number) {
      self['height'] = height;
      return this;
    },
    request: (
      service: string,
      method: string,
      data: Uint8Array
    ): Promise<Uint8Array> => {
      const path = `/${service}/${method}`;
      const height = self['height'];
      self['height'] = undefined;
      // console.debug(` get ${path} at ${height}`);
      return base.queryUnverified(path, data, height);
    }
  };
}
