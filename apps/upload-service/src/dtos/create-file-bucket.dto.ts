import { IsNotEmpty, IsOptional } from 'class-validator';
import { ObjectId } from 'mongoose';

export class CreateBucketFileDto {
  @IsOptional()
  workspaceId: string;

  @IsNotEmpty()
  channelId: string;

  @IsNotEmpty()
  fileId: ObjectId;
}
