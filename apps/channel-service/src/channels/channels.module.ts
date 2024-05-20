import { DatabaseModule, LoggerModule } from '@app/common';
import { Module } from '@nestjs/common';
import { ChannelGateway } from './gateway/channel.gateway';
import { ChannelRepository } from './channel.repository';
import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';
import { Channel, ChannelSchema } from './schema/channel.schema';

@Module({
  imports: [
    DatabaseModule,
    DatabaseModule.forFeature([
      {
        name: Channel.name,
        schema: ChannelSchema,
      },
    ]),
    LoggerModule,
  ],
  controllers: [ChannelsController],
  providers: [ChannelsService, ChannelRepository, ChannelGateway],
})
export class ChannelsModule {}
