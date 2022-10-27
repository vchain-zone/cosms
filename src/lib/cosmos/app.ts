import { StdFee } from '@cosmjs/amino';

import { Provider } from '../providers';
import {
  createProtobufRpcMessageClient,
  ProtobufRpcMessageClient,
} from '../queryclient/ProtobufRpcMessageClient';
import {
  createProtobufRpcStateClient,
  ProtobufRpcStateClient,
} from '../queryclient/ProtobufRpcStateClient';
import { Wallet } from '../wallet';

export class App {
  private _prefixServicesName: string;

  get messageRpc(): ProtobufRpcMessageClient {
    if (!this._messageRpc) {
      throw 'Must set wallet first';
    }
    return this._messageRpc;
  }

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
  public messageProtobuf;
  public queryProtobuf;
  public query;

  public block: (height?: number) => this;

  private provider: Provider;
  private readonly rpc: ProtobufRpcStateClient;
  private _messageRpc: ProtobufRpcMessageClient;
  private _wallet: Wallet;

  constructor(provider: Provider) {
    this.provider = provider;
    this.rpc = createProtobufRpcStateClient(this.provider.batchQueryClient.getQueryClient());

    this.block = this.rpc.block;
  }

  prefixServices(prefix?: string) {
    this._prefixServicesName = prefix;
    this.rpc.prefixService(prefix);
    if (this._messageRpc) {
      this.messageRpc.prefixService(prefix);
    }

    return this;
  }

  setQueryClient(QueryClientImpl: any) {
    this.query = new QueryClientImpl(this.rpc);
  }

  setProtobuf(Protobuf: any) {
    this.protobuf = Protobuf;
  }

  setMessageProtobuf(Protobuf: any) {
    this.messageProtobuf = Protobuf;
  }

  setQueryProtobuf(Protobuf: any) {
    this.queryProtobuf = Protobuf;
  }

  setMessage(Message: any) {
    this._messageRpc = createProtobufRpcMessageClient(
      this.provider.batchQueryClient.getQueryClient(),
      Message
    );
    this._messageRpc.prefixService(this._prefixServicesName);
    this.message = new Message.MsgClientImpl(this.messageRpc);
  }

  setWallet(wallet: Wallet) {
    this._wallet = wallet;
  }

  getCurrentMessage() {
    return this._messageRpc.currentMessage();
  }

  sendMessage(fee: StdFee | 'auto' | number, memo?: string) {
    return this.messageRpc.send(this.wallet, fee, memo);
  }
}
