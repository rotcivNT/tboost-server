import {
  LinkMetadata,
  MessageItem,
} from 'apps/message-service/src/messages/schema/message.schema';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { FileData } from 'types';
import { MessageType } from '../../constants';
import { Type } from 'class-transformer';

export class Sender {
  clerkUserId: string;
  fullName: string;
  imageUrl: string;
}
export class CreateMessageDto {
  @IsNotEmpty()
  receiverId: string;

  @IsNotEmpty()
  senderId: string;

  @IsNotEmpty()
  @Type(() => Sender)
  sender: Sender;

  @IsIn(Object.entries(MessageType).map(([, val]) => val))
  type: string;

  @IsOptional()
  forwarder: string;

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
  replyFor: MessageItem;

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
