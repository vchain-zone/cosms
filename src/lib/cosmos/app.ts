import { provider } from '../providers';
import {
  createProtobufRpcStateClient,
  ProtobufRpcStateClient
} from '../queryclient/utils';


export class App {
  public message;
  public protobuf;
  public query;

  public block: (height?: number) => this;

  private provider: provider;
  private readonly rpc: ProtobufRpcStateClient;

  constructor(provider: provider) {
    this.provider = provider;
    this.rpc = createProtobufRpcStateClient(
      this.provider.batchQueryClient.getQueryClient()
    );
    this.block = this.rpc.block;
    this.message = {};
  }

  setQueryClient(QueryClientImpl: any) {
    this.query = new QueryClientImpl(this.rpc);
  }

  setProtobuf(Protobuf: any) {
    this.query = new Protobuf(this.rpc);
  }

  setMessage(Message: any) {
    this.message = Message(this.rpc);
  }
}
