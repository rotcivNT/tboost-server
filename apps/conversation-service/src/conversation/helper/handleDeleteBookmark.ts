import { HttpStatus } from '@nestjs/common';
import { Channel } from 'amqp-connection-manager';
import { DeleteBookmarkDto } from 'apps/api-gateway/src/dtos/conversation-dto/channel-dto/delete-bookmark.dto';
import { ApiStatus } from 'apps/api-gateway/src/types/api-status';
import { DeleteBookmarkReponseDto } from '../dto/response-dto/delete-bookmark-reponse.dto';
import { DirectConversation } from '../schema/direct-conversation.schema';
import ChannelHelper from './channel.helper';

export const handleDeleteBookmark = async (
  conversation: Channel | DirectConversation,
  deleteBookmarkDto: DeleteBookmarkDto,
): Promise<DeleteBookmarkReponseDto> => {
  const { isFolder, bookmarkName, parentName } = deleteBookmarkDto;

  if (isFolder) {
    const res = await ChannelHelper.deleteBookmarkFolder(
      conversation,
      bookmarkName,
    );
    if (res.code === -1) {
      return {
        data: null,
        message: res.message,
        statusCode: HttpStatus.BAD_REQUEST,
        status: ApiStatus.ERROR,
      };
    }
  } else {
    const res = await ChannelHelper.deleteBookmark(
      conversation,
      bookmarkName,
      parentName,
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
