import { Injectable } from '@nestjs/common';
import * as Pusher from 'pusher';

@Injectable()
export class PusherService {
  pusher: Pusher;

  constructor() {
    this.pusher = new Pusher({
      appId: '1809255',
      key: 'e7bb011c90e1ac1b07cf',
      secret: '905cf4ad71fe2cac0fbe',
      cluster: 'ap1',
    });
  }

  async trigger(
    channels: string | string[],
    event: string,
    data: any,
    socket_id?: string,
  ) {
    return this.pusher.trigger(channels, event, data, { socket_id });
  }
}
