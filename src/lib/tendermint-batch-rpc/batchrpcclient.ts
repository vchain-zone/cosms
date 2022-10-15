import { JsonRpcRequest, JsonRpcSuccessResponse } from '@cosmjs/json-rpc';
import { RpcClient } from '@cosmjs/tendermint-rpc/build/rpcclients';

/**
 * An event emitted from Tendermint after subscribing via RPC.
 *
 * These events are passed as the `result` of JSON-RPC responses, which is kind
 * of hacky because it breaks the idea that exactly one JSON-RPC response belongs
 * to each JSON-RPC request. But this is how subscriptions work in Tendermint.
 */
export interface BatchRpcClient extends RpcClient {
  readonly executeBatch: (requests: JsonRpcRequest[]) => Promise<JsonRpcSuccessResponse[]>;
  readonly disconnect: () => void;
}
