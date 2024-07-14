import { Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { FileData } from 'types';

export class CreateFileDto {
  @IsNotEmpty()
  @Type(() => FileData)
  fileData: FileData;

  @IsNotEmpty()
  senderId: string;

  @IsNotEmpty()
  createdAt: Date;

  @IsNotEmpty()
  updatedAt: Date;
}
