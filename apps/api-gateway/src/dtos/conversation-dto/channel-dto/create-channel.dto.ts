import { BookmarkFolder } from 'apps/conversation-service/src/types/bookmark-folder.type';
import { Bookmark } from 'apps/conversation-service/src/types/bookmark.type';
import { ChannelSettings } from 'apps/conversation-service/src/types/channel-setting.type';
import { ConversationMember } from 'apps/conversation-service/src/types/conversation.type';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  MinLength,
} from 'class-validator';

export class CreateChannelDto {
  // Required: name, type, workspaceID, creatorID, members
  @IsNotEmpty()
  @MinLength(1)
  name: string;

  @IsNotEmpty()
  isPublic: boolean;

  @IsNotEmpty()
  creatorID: string;

  @IsNotEmpty()
  workspaceID: string;

  @ArrayMinSize(1)
  members: ConversationMember[];

  topic: string;

  description: string;

  @IsOptional()
  @IsArray()
  bookmarks?: Bookmark[];

  @IsOptional()
  @IsArray()
  bookmarkFolders?: BookmarkFolder[];

  @IsOptional()
  @IsObject()
  settings: ChannelSettings;

  @IsOptional()
  addAllMember: boolean;
}
