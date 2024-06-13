import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { MessageType } from '../../constants';
import { LinkMetadata, Sender } from '../schema/message.schema';
import { FileData } from 'types';

export class CreateMessageDto {
  @IsNotEmpty()
  receiverId: string;

  // @IsNotEmpty()
  // date: string;

  @IsNotEmpty()
  @Type(() => Sender)
  sender: Sender;

  @IsIn(Object.entries(MessageType).map(([, val]) => val))
  type: string;

  @IsOptional()
  @Type(() => Sender)
  forwarder: Sender;

  @IsNotEmpty()
  uniqueId: string;

  @IsOptional()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsArray()
  @IsOptional()
  files: FileData[];

  @IsOptional()
  replyFor: string;

  @IsOptional()
  metadata: LinkMetadata;

  @IsOptional()
  isRecall: boolean;

  @IsOptional()
  isDelete: boolean;

  @IsOptional()
  reactions: [];

  @IsOptional()
  createdAt: Date;

  @IsOptional()
  updatedAt: Date;

  @IsNotEmpty()
  socketId: string;
}
