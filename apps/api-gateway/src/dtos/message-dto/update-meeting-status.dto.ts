import { IsNotEmpty } from 'class-validator';
import { Sender } from './create-message.dto';
import { Type } from 'class-transformer';

export class UpdateMeetingStatusDto {
  @IsNotEmpty()
  meetingLink: string;
  @IsNotEmpty()
  isDelete: boolean;
  @IsNotEmpty()
  @Type(() => Sender)
  sender: Sender;
}
