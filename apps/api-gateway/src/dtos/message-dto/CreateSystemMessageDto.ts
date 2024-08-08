import { IsNotEmpty } from 'class-validator';
import { Sender } from './create-messate.dto';
import { Type } from 'class-transformer';

export class CreateSystemMessageDto {
  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  senderId: string;

  @IsNotEmpty()
  channelId: string;

  @IsNotEmpty()
  type: string;

  @IsNotEmpty()
  @Type(() => Sender)
  sender: Sender;
}
