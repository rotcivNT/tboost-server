import { Sender } from 'apps/api-gateway/src/dtos/message-dto/create-message.dto';
import { MessageItem } from '../schema/message.schema';

// Tạo type mới kết hợp MessageType và Sender
export type MessageResponse = Omit<MessageItem, ''> & {
  sender: Sender;
  replyMessage?: MessageResponse[];
};

export type ClusterReponse = {
  _id: string;
  messages: MessageResponse[];
};
