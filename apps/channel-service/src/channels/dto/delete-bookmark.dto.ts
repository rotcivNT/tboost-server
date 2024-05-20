import { IsNotEmpty, IsOptional } from 'class-validator';

export class DeleteBookmarkDto {
  @IsNotEmpty()
  isFolder: boolean;

  @IsNotEmpty()
  bookmarkName: string;

  @IsOptional()
  parentName: string;
}
