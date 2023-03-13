import {
  QueryClientImpl
} from 'cosmjs-types/ibc/applications/transfer/v1/query';
import * as IbcTransferProtobuf
  from 'cosmjs-types/ibc/applications/transfer/v1/transfer';
import * as MsgClientIbcTransfer
  from 'cosmjs-types/ibc/applications/transfer/v1/tx';
import {
  MsgClientImpl as MsgClientImplIbcTransfer
} from 'cosmjs-types/ibc/applications/transfer/v1/tx';
import {
  MsgClientImpl as MsgClientImplIbcChannel
} from 'cosmjs-types/ibc/core/channel/v1/tx';
import {
  MsgClientImpl as MsgClientImplIbcClient
} from 'cosmjs-types/ibc/core/client/v1/tx';
import {
  MsgClientImpl as MsgClientImplIbcConnection
} from 'cosmjs-types/ibc/core/connection/v1/tx';


import { Provider } from '../providers';
import { ProtobufRpcBatchClient } from '../queryclient/ProtobufRpcBatchClient';
import { ProtobufRpcStateClient } from '../queryclient/ProtobufRpcStateClient';

import { App } from './app';

class MsgClientImpl extends MsgClientImplIbcTransfer {
}

export class Ibc extends App {
  public declare query: QueryClientImpl & ProtobufRpcStateClient;
  public declare queryBatch: QueryClientImpl & ProtobufRpcBatchClient;
  public declare message: MsgClientImpl;
  public declare messageCore: {
    channel: MsgClientImplIbcChannel,
    client: MsgClientImplIbcClient,
    connection: MsgClientImplIbcConnection,
  };
  public protobuf = IbcTransferProtobuf;

  constructor(provider: Provider) {
    super(provider);
    this.setQueryClient(QueryClientImpl);
    const MsgClient = { ...MsgClientIbcTransfer };
    this.setMessage(MsgClient);
    // this.messageCore = this.createMessageCore();
  }

  createMessageCore(prefixServicesName?: string) {
    this.messageCore.channel = this.createMessageInstance(MsgClientImplIbcChannel, prefixServicesName);
    this.messageCore.client = this.createMessageInstance(MsgClientImplIbcClient, prefixServicesName);
    this.messageCore.connection = this.createMessageInstance(MsgClientImplIbcConnection, prefixServicesName);
    return this.messageCore;
  }

}
