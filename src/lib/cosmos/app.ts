import { Provider } from '../providers';
import {
  createProtobufRpcStateClient,
  ProtobufRpcStateClient
} from '../queryclient/utils';
import { Wallet } from '../wallet';

export class App {
  public prefixService: (prefix?: string) => this;

  set wallet(value: Wallet) {
    this._wallet = value;
  }

  get wallet(): Wallet {
    if (!this._wallet) {
      throw 'Must set wallet first';
    }
    return this._wallet;
  }

  public message;
  public protobuf;
  public query;

  public block: (height?: number) => this;

  private provider: Provider;
  private readonly rpc: ProtobufRpcStateClient;
  private _wallet: Wallet;

  constructor(provider: Provider) {
    this.provider = provider;
    this.rpc = createProtobufRpcStateClient(
      this.provider.batchQueryClient.getQueryClient()
    );
    this.block = this.rpc.block;
    this.prefixService = this.rpc.prefixService;
    this.message = {};
  }

  setQueryClient(QueryClientImpl: any) {
    this.query = new QueryClientImpl(this.rpc);
  }

  setProtobuf(Protobuf: any) {
    this.query = new Protobuf(this.rpc);
  }

  setMessage(Message: any) {
    this.message = new Message(this.rpc);
  }

  setWallet(wallet: Wallet) {
    this._wallet = wallet;
  }
}
