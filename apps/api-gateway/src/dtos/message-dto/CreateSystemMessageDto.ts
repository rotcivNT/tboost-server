import { IsNotEmpty } from 'class-validator';

export class CreateSystemMessageDto {
  @IsNotEmpty()
  content: string;
  @IsNotEmpty()
  senderId: string;
  @IsNotEmpty()
  channelId: string;
  @IsNotEmpty()
  type: string;
}
