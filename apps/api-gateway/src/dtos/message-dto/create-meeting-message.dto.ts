import { Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { Sender } from './create-message.dto';

export class CreateMeetingMessageDto {
  @IsNotEmpty()
  channelId: string;
  @IsNotEmpty()
  senderId: string;
  @IsNotEmpty()
  meetingLink: string;

  @IsNotEmpty()
  @Type(() => Sender)
  sender: Sender;
}
