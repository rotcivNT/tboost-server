import { IsNotEmpty, IsOptional } from 'class-validator';

export class UploadFileDto {
  @IsNotEmpty()
  senderId: string;

  @IsNotEmpty()
  channelId: string;

  @IsOptional()
  workspaceId: string;
}
