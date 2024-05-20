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
