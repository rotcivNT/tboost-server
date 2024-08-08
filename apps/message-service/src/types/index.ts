import { Sender } from 'apps/api-gateway/src/dtos/message-dto/create-messate.dto';
import { MessageItem } from '../messages/schema/message.schema';

// Tạo type mới kết hợp MessageType và Sender
export type MessageResponse = Omit<MessageItem, ''> & {
  sender: Sender;
  replyMessage?: MessageResponse[];
};

export type ClusterReponse = {
  _id: string;
  messages: MessageResponse[];
};
