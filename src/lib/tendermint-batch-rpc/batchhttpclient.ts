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

export class BatchHttpClient extends HttpClient {
  protected readonly url: string;
  protected readonly headers: Record<string, string> | undefined;

  public constructor(endpoint: string | HttpEndpoint) {
    super(endpoint);
  }

  public async executeBatch(requests: JsonRpcRequest[]): Promise<JsonRpcSuccessResponse[]> {
    const responses = await http('POST', this.url, this.headers, requests);
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