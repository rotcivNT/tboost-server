import {
  UpdateBookmarkDto,
  UpdateBookmarkFolderDto,
} from 'apps/api-gateway/src/dtos/conversation-dto/channel-dto/update-bookmark.dto';
import { Channel } from '../schema/channel.schema';
import { DirectConversation } from '../schema/direct-conversation.schema';
import ChannelHelper from './channel.helper';
import { HttpStatus } from '@nestjs/common';
import { ApiStatus } from 'apps/api-gateway/src/types/api-status';
import { UpdateBookmarkReponseDto } from '../dto/response-dto/update-bookmark-response.dto';

export const handleUpdateBookmark = async (
  conversation: Channel | DirectConversation,
  isFolder: boolean,
  payload: UpdateBookmarkDto | UpdateBookmarkFolderDto,
): Promise<UpdateBookmarkReponseDto> => {
  if (isFolder) {
    const res = await ChannelHelper.updateBookmarkFolder(
      conversation,
      payload.previousName,
      payload.name,
    );

    if (res.code === -1)
      return {
        data: null,
        message: res.message,
        statusCode: HttpStatus.BAD_REQUEST,
        status: ApiStatus.ERROR,
      };
  } else {
    const res = await ChannelHelper.updateBookmark(
      conversation,
      payload as UpdateBookmarkDto,
    );
    if (res.code === -1)
      return {
        data: null,
        message: res.message,
        statusCode: HttpStatus.BAD_REQUEST,
        status: ApiStatus.ERROR,
      };
  }
  return {
    data: conversation,
    message: 'Success',
    statusCode: HttpStatus.OK,
    status: ApiStatus.OK,
  };
};
