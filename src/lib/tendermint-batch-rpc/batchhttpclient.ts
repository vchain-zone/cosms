import {
  isJsonRpcErrorResponse,
  JsonRpcRequest,
  JsonRpcSuccessResponse,
  parseJsonRpcResponse
} from '@cosmjs/json-rpc';
import {
  HttpClient,
  HttpEndpoint
} from '@cosmjs/tendermint-rpc/build/rpcclients';
import { http } from '@cosmjs/tendermint-rpc/build/rpcclients/httpclient';
import { orderByFromJSON } from 'cosmjs-types/cosmos/tx/v1beta1/service';

export class BatchHttpClient extends HttpClient {
  protected readonly declare url: string;
  protected readonly declare headers: Record<string, string> | undefined;

  public constructor(endpoint: string | HttpEndpoint) {
    super(endpoint);
  }

  public async executeBatch(
    requests: JsonRpcRequest[]
  ): Promise<JsonRpcSuccessResponse[]> {
    let responses = await http('POST', this.url, this.headers, requests);
    if (!(responses instanceof Array)) responses = [responses];

    const parsedResponses = [];
    for (const response of responses) {
      const parsedResponse = parseJsonRpcResponse(response);
      parsedResponses.push(parsedResponse);
      if (isJsonRpcErrorResponse(response)) {
        throw new Error(JSON.stringify(response.error));
      }
    }
    return parsedResponses;
  }
}
