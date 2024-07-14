import { IsNotEmpty } from 'class-validator';
import { Sender } from './create-messate.dto';
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
