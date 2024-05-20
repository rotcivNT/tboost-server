import { EventsGateway } from '@app/common/events/events.gateway';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { ChannelsService } from '../channels.service';

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
    const res = await this.channelsService.createBookmark(
      data.channelId,
      data.isFolder,
      data.payload,
    );
    return { event: 'add-bookmark', data: res };
  }

  @SubscribeMessage('update-bookmark')
  async handleUpdateBookmark(@MessageBody() data: any) {
    const res = await this.channelsService.updateBookmark(
      data.channelId,
      data.isFolder,
      data.payload,
    );

    return { event: 'add-bookmark', data: res };
  }

  @SubscribeMessage('delete-bookmark')
  async handleDeleteBookmark(@MessageBody() payload: any) {
    const res = await this.channelsService.deleteBookmark(
      payload.channelId,
      payload.bookmarkData,
    );

    return { event: 'add-bookmark', data: res };
  }
}
