import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  MinLength,
} from 'class-validator';
import { ChannelMember } from '../schema/channel.schema';
import { BookmarkFolder } from '../schema/types/bookmark-folder.type';
import { Bookmark } from '../schema/types/bookmark.type';

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
}
