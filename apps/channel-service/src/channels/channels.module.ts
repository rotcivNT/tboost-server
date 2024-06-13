import { LoggerModule } from '@app/common';
import { PusherModule } from '@app/common/pusher/pusher.module';
import { PusherService } from '@app/common/pusher/pusher.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ChannelInvitationRepository } from './channel-invitation.repository';
import { ChannelRepository } from './channel.repository';
import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';
import { ChannelGateway } from './gateway/channel.gateway';
import {
  ChannelInvitation,
  ChannelInvitationSchema,
} from './schema/channel-invitation.schema';
import { Channel, ChannelSchema } from './schema/channel.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'apps/channel-service/.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      {
        name: Channel.name,
        schema: ChannelSchema,
      },
      {
        name: ChannelInvitation.name,
        schema: ChannelInvitationSchema,
      },
    ]),
    LoggerModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          transport: {
            host: 'smtp.gmail.com',
            port: 587,
            auth: {
              user: configService.get('GMAIL_APP_USER'),
              pass: configService.get('GMAIL_APP_PASSWORD'),
            },
          },
        };
      },
      inject: [ConfigService],
    }),
    PusherModule,
  ],
  controllers: [ChannelsController],
  providers: [
    ChannelsService,
    ChannelRepository,
    ChannelGateway,
    ChannelInvitationRepository,
    PusherService,
  ],
})
export class ChannelsModule {}
