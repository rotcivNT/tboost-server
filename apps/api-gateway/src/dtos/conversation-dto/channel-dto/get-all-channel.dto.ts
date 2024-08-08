import { IsNotEmpty } from 'class-validator';

export class GetAllChannelDto {
  @IsNotEmpty()
  workspaceId: string;
  @IsNotEmpty()
  userId: string;
}
