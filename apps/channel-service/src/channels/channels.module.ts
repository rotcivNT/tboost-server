import { LoggerModule } from '@app/common';
import { DatabaseModule } from '@app/common/database/database.module';
import { PusherModule } from '@app/common/pusher/pusher.module';
import { PusherService } from '@app/common/pusher/pusher.service';
import { RmqModule } from '@app/common/rmq/rmq.module';
import { RmqService } from '@app/common/rmq/rmq.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MESSAGE_SERVICE } from 'apps/api-gateway/src/constants/services';
import * as Joi from 'joi';
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
      isGlobal: true,
      envFilePath: 'apps/channel-service/.env',
      validationSchema: Joi.object({
        GMAIL_APP_USER: Joi.string().required(),
        GMAIL_APP_PASSWORD: Joi.string().required(),
      }),
    }),
    DatabaseModule.register({ connectionName: 'CHANNEL' }),
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
    RmqModule.register({
      name: MESSAGE_SERVICE,
    }),
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
    RmqService,
  ],
})
export class ChannelsModule {}
