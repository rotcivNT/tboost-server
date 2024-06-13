import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  MinLength,
} from 'class-validator';
import { ChannelMember } from '../schema/channel.schema';
import { BookmarkFolder } from '../schema/types/bookmark-folder.type';
import { Bookmark } from '../schema/types/bookmark.type';
import { ChannelSettings } from '../schema/types/channel-setting.type';

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
