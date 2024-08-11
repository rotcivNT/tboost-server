import { AbstractDocument } from '@app/common/database/abstract.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export class TaskAttachment {
  fileName: string;
  mimeType: string;
  fileUrl: string;
  createdAt: string;
}

@Schema({
  versionKey: false,
  collection: 'channel-tasks',
})
export class ChannelTask extends AbstractDocument {
  @Prop({ required: true })
  channelId: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  cover: string;

  @Prop()
  description: string;

  @Prop({ required: true, type: [String] })
  memberIds: string[];

  @Prop({ type: [TaskAttachment] })
  attachments: TaskAttachment[];

  @Prop({ required: true, type: Date })
  createdAt: Date;

  @Prop({ required: true, type: Date })
  updatedAt: Date;
}

export const ChannelTaskSchema = SchemaFactory.createForClass(ChannelTask);
