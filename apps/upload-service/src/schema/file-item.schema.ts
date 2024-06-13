import { AbstractDocument } from '@app/common/database/abstract.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { FileData } from 'types';

@Schema({ versionKey: false, collection: 'file-item' })
export class FileItem extends AbstractDocument {
  @Prop({ required: true })
  senderId: string;

  @Prop({ required: true, type: FileData })
  fileData: FileData;

  @Prop()
  isDelete: boolean;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  updatedAt: Date;
}

export const FileItemSchema = SchemaFactory.createForClass(FileItem);
