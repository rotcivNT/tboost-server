import { AbstractDocument } from '@app/common/database/abstract.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { ChannelTask } from './channel-task.schema';

@Schema({
  versionKey: false,
  collection: 'channel-task-column',
})
export class ChannelTaskColumn extends AbstractDocument {
  @Prop({ required: true })
  channelId: string;

  @Prop({ required: true })
  title: string;

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'tasksOrderIds',
  })
  taskOrderIds: ChannelTask[];

  @Prop({ required: true, type: Date })
  createdAt: Date;

  @Prop({ required: true, type: Date })
  updatedAt: Date;
}

export const ChannelTaskColumnSchema =
  SchemaFactory.createForClass(ChannelTaskColumn);

ChannelTaskColumnSchema.index({ channelId: 1 });
