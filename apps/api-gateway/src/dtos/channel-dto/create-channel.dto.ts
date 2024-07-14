import { ChannelMember } from 'apps/channel-service/src/channels/schema/channel.schema';
import { BookmarkFolder } from 'apps/channel-service/src/channels/schema/types/bookmark-folder.type';
import { Bookmark } from 'apps/channel-service/src/channels/schema/types/bookmark.type';
import { ChannelSettings } from 'apps/channel-service/src/channels/schema/types/channel-setting.type';
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
  members: ChannelMember[];

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
}
