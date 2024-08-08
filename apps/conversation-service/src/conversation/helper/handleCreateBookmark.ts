import { HttpStatus } from '@nestjs/common';
import {
  CreateBookmarkDto,
  CreateBookmarkFolderDto,
} from 'apps/api-gateway/src/dtos/conversation-dto/channel-dto/create-bookmark.dto';
import { ApiStatus } from 'apps/api-gateway/src/types/api-status';
import { CreateBookmarkResponseDto } from '../dto/response-dto/create-bookmark-response.dto';
import { Channel } from '../schema/channel.schema';
import { DirectConversation } from '../schema/direct-conversation.schema';
import ChannelHelper from './channel.helper';

export async function handleCreateBookmark(
  conversation: Channel | DirectConversation,
  isFolder: boolean,
  payload: CreateBookmarkDto | CreateBookmarkFolderDto,
): Promise<CreateBookmarkResponseDto> {
  if (isFolder) {
    const res = await ChannelHelper.addBookmarkFolder(
      conversation,
      payload.name,
    );
    if (res.code === -1) {
      return {
        data: null,
        message: res.message,
        statusCode: HttpStatus.BAD_REQUEST,
        status: ApiStatus.ERROR,
      };
    }
    conversation.bookmarkFolders.push(res.data);
  } else {
    const res = await ChannelHelper.addBookmark(
      conversation,
      payload as CreateBookmarkDto,
    );

    if (res.code === -1) {
      return {
        data: null,
        message: res.message,
        statusCode: HttpStatus.BAD_REQUEST,
        status: ApiStatus.ERROR,
      };
    }
    // Add bookmark to folder
    if (res.folderIndex !== undefined && res.folderIndex !== -1) {
      conversation.bookmarkFolders[res.folderIndex] = res.updatedFolder;
    } else {
      conversation.bookmarks.push(res.data);
    }
  }

  return {
    data: conversation,
    message: 'Success',
    statusCode: HttpStatus.CREATED,
    status: ApiStatus.OK,
  };
}
