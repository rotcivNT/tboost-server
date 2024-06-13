import { AbstractDocument } from '@app/common/database/abstract.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { FileData } from 'types';

export class Sender {
  senderId: string;
  fullName: string;
  imageUrl: string;
}

class Reaction {
  emoji: string;
  count: number;
  reactorName: string;
}

export class LinkMetadata {
  thumbnail: string;
  title: string;
  subtitle: string;
  description: string;
}

@Schema({ versionKey: false, collection: 'message-item' })
export class MessageItem extends AbstractDocument {
  @Prop({ required: true })
  receiverId: string;

  @Prop({ required: true, type: Sender })
  sender: Sender;

  // @Prop({ required: true })
  // date: string;

  // người chuyển tiếp tin nhắn nếu có
  @Prop({ type: Sender })
  fowarder: Sender;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  uniqueId: string;

  @Prop()
  content: string;

  @Prop({ required: true })
  files: FileData[];

  @Prop()
  isRecall: boolean;

  @Prop()
  isDelete: boolean;

  @Prop({ type: [Reaction] })
  reactions: Reaction[];

  @Prop()
  replyFor: string;

  @Prop({ type: LinkMetadata })
  metadata: LinkMetadata;

  @Prop({ isRequired: true })
  createdAt: Date;

  @Prop({ isRequired: true })
  updatedAt: Date;
}

export const MessageItemSchema = SchemaFactory.createForClass(MessageItem);
