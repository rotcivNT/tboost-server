import { IsNotEmpty } from 'class-validator';

export class CreateTaskColumnDto {
  @IsNotEmpty()
  channelId: string;

  @IsNotEmpty()
  title: string;
}
