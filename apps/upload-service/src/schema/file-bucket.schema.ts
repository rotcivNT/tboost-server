import { AbstractDocument } from '@app/common/database/abstract.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { FileItem } from './file-item.schema';

@Schema({ versionKey: false, collection: 'file-bucket' })
export class FileBucket extends AbstractDocument {
  @Prop({ required: true })
  channelId: string;

  @Prop({ required: true })
  workspaceId: string;

  @Prop({ required: true })
  bucketId: string;

  @Prop({
    required: true,
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'FileItem',
  })
  files: FileItem[];

  @Prop({ required: true })
  count: number;

  @Prop({ required: true, default: new Date() })
  createdAt: Date;

  @Prop({ required: true, default: new Date() })
  updatedAt: Date;
}

export const FileBucketSchema = SchemaFactory.createForClass(FileBucket);
