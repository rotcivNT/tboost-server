import { AbstractDocument } from '@app/common/database/abstract.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { FileData } from 'types';

class Reaction {
  emoji: string;
  count: number;
  reactorName: string;
}

export class LinkMetadata {
  url: string;
  favicon: string;
  domain: string;
  sitename: string;
  image: string;
  description: string;
}

@Schema({ versionKey: false, collection: 'message-item' })
export class MessageItem extends AbstractDocument {
  @Prop({ required: true })
  receiverId: string;

  @Prop({ required: true })
  senderId: string;

  // người chuyển tiếp tin nhắn nếu có
  @Prop()
  fowarder: string;

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

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReplyFor',
  })
  replyFor: this;

  @Prop({ type: LinkMetadata })
  metadata: LinkMetadata;

  @Prop({ isRequired: true })
  createdAt: Date;

  @Prop({ isRequired: true })
  updatedAt: Date;
}

export const MessageItemSchema = SchemaFactory.createForClass(MessageItem);
