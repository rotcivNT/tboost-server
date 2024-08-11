import { PartialType } from '@nestjs/mapped-types';
import { CreateDirectConversationDto } from './create-direct-conversation';
import { BookmarkFolder } from 'apps/conversation-service/src/types/bookmark-folder.type';
import { Bookmark } from 'apps/conversation-service/src/types/bookmark.type';
import { IsArray, IsOptional } from 'class-validator';

export class UpdateDirectConversationDto extends PartialType(
  CreateDirectConversationDto,
) {
  @IsOptional()
  @IsArray()
  bookmarks: Bookmark[];

  @IsOptional()
  topic: string;

  @IsOptional()
  @IsArray()
  bookmarkFolders: BookmarkFolder[];
}
