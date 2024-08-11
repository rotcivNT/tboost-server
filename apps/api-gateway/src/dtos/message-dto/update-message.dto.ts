import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { CreateMessageDto } from './create-message.dto';

export class UpdateMessageDto extends PartialType(CreateMessageDto) {
  @IsNotEmpty()
  _id: string;

  @IsNotEmpty()
  channelId: string;

  @IsOptional()
  socketId: string;
}
