import { IsNotEmpty } from 'class-validator';

export class GetAllChannelDto {
  @IsNotEmpty()
  workspaceID: string;
  @IsNotEmpty()
  creatorID: string;
}
