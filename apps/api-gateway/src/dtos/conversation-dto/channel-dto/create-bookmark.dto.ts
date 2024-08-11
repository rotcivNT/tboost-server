import { ConversationType } from 'apps/conversation-service/src/types/conversation.type';
import { Type } from 'class-transformer';
import { IsIn, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

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

  @IsOptional()
  @IsIn([ConversationType.DIRECT_MESSAGE, ConversationType.CHANNEL])
  type: ConversationType;
}
