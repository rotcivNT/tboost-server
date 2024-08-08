import { IsArray, IsNotEmpty, MinLength } from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty()
  columnId: string;

  @IsNotEmpty()
  channelId: string;

  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  @IsArray()
  @MinLength(1)
  memberIds: string[];
}
