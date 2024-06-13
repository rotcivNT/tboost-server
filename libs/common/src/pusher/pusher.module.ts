import { Module } from '@nestjs/common';
import { PusherService } from './pusher.service';

@Module({
  providers: [PusherService],
})
export class PusherModule {}
