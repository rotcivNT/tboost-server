import { EventsGateway } from '@app/common/events/events.gateway';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { isValidObjectId } from 'mongoose';
import { ChannelsService } from '../channels.service';
import { InvalidObjectIdException } from '../exceptions/invalid-object-id.exception';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChannelGateway extends EventsGateway {
  constructor(private readonly channelsService: ChannelsService) {
    super();
  }

  @SubscribeMessage('add-bookmark')
  async handleAddBookmark(@MessageBody() data: any) {
    try {
      if (!isValidObjectId(data.channelId)) {
        throw new InvalidObjectIdException(
          `${data.channelId} is not a valid ObjectId`,
        );
      }
      const res = await this.channelsService.createBookmark(
        data.channelId,
        data.isFolder,
        data.payload,
      );
      return { event: 'add-bookmark', data: res };
    } catch (e) {
      return { event: 'add-bookmark', data: e };
    }
  }

  @SubscribeMessage('update-bookmark')
  async handleUpdateBookmark(@MessageBody() data: any) {
    try {
      if (!isValidObjectId(data.channelId)) {
        throw new InvalidObjectIdException(
          `${data.channelId} is not a valid ObjectId`,
        );
      }
      const res = await this.channelsService.updateBookmark(
        data.channelId,
        data.isFolder,
        data.payload,
      );

      return { event: 'add-bookmark', data: res };
    } catch (e) {
      return { event: 'add-bookmark', data: e };
    }
  }

  @SubscribeMessage('delete-bookmark')
  async handleDeleteBookmark(@MessageBody() payload: any) {
    try {
      if (!isValidObjectId(payload.channelId)) {
        throw new InvalidObjectIdException(
          `${payload.channelId} is not a valid ObjectId`,
        );
      }
      const res = await this.channelsService.deleteBookmark(
        payload.channelId,
        payload.bookmarkData,
      );

      return { event: 'add-bookmark', data: res };
    } catch (e) {
      return { event: 'add-bookmark', data: e };
    }
  }
}
