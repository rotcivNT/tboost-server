import { IsNotEmpty } from 'class-validator';

export class DeleteFileMessageDto {
  @IsNotEmpty()
  _id: string;

  @IsNotEmpty()
  fileUrl: string;

  @IsNotEmpty()
  channelId: string;

  @IsNotEmpty()
  socketId: string;
}
