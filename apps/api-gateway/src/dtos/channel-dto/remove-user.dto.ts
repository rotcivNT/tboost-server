import { IsNotEmpty } from 'class-validator';

export class RemoveUserDto {
  @IsNotEmpty()
  channelId: string;
  @IsNotEmpty()
  deleteId: string;
  @IsNotEmpty()
  senderId: string;
}
