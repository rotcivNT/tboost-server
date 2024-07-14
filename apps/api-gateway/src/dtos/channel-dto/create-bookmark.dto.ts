import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateBookmarkFolderDto {
  @IsNotEmpty()
  name: string;
}

export class CreateBookmarkDto extends CreateBookmarkFolderDto {
  @IsNotEmpty()
  @IsUrl()
  url: string;

  @IsNotEmpty()
  thumbnail: string;

  @IsOptional()
  @IsNotEmpty()
  folderName: string;
}

export class BookmarkDto {
  @IsOptional()
  isFolder: boolean;
  @IsNotEmpty()
  @Type(() => CreateBookmarkDto || CreateBookmarkFolderDto)
  payload: CreateBookmarkDto | CreateBookmarkFolderDto;
}
