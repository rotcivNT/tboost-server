import { IsNotEmpty, IsUrl } from 'class-validator';

export class UpdateBookmarkFolderDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  previousName: string;
}

export class UpdateBookmarkDto extends UpdateBookmarkFolderDto {
  @IsNotEmpty()
  @IsUrl()
  url: string;

  @IsNotEmpty()
  thumbnail: string;

  @IsNotEmpty()
  folderName: string;
}
