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
import {
  AUTH_SERVICE,
  CONVERSATION_SERVICE,
  MESSAGE_SERVICE,
} from 'apps/api-gateway/src/constants/services';
import * as Joi from 'joi';
import { ChannelInvitationRepository } from './channel-invitation.repository';
import { ChannelRepository } from './channel.repository';
import { ConversationsController } from './conversation.controller';
import { ConversationsService } from './conversation.service';
import {
  ChannelInvitation,
  ChannelInvitationSchema,
} from './schema/channel-invitation.schema';
import { Channel, ChannelSchema } from './schema/channel.schema';
import {
  DirectConversation,
  DirectConversationSchema,
} from './schema/direct-conversation.schema';
import { DirectConversationRepository } from './direct-conversation.repository';
import { ChannelTask, ChannelTaskSchema } from './schema/channel-task.schema';
import { ChannelTaskRepository } from './channel-task.repository';
import {
  ChannelTaskColumn,
  ChannelTaskColumnSchema,
} from './schema/channel-task-column';
import { ChannelTaskColumnRepository } from './channel-task-column.repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/conversation-service/.env',
      validationSchema: Joi.object({
        GMAIL_APP_USER: Joi.string().required(),
        GMAIL_APP_PASSWORD: Joi.string().required(),
      }),
    }),
    DatabaseModule.register({ connectionName: CONVERSATION_SERVICE }),
    MongooseModule.forFeature([
      {
        name: Channel.name,
        schema: ChannelSchema,
      },
      {
        name: ChannelInvitation.name,
        schema: ChannelInvitationSchema,
      },
      {
        name: DirectConversation.name,
        schema: DirectConversationSchema,
      },
      {
        name: ChannelTask.name,
        schema: ChannelTaskSchema,
      },
      {
        name: ChannelTaskColumn.name,
        schema: ChannelTaskColumnSchema,
      },
    ]),
    LoggerModule,
    RmqModule.register({
      name: MESSAGE_SERVICE,
    }),
    RmqModule.register({
      name: AUTH_SERVICE,
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
  controllers: [ConversationsController],
  providers: [
    ConversationsService,
    ChannelRepository,
    ChannelInvitationRepository,
    DirectConversationRepository,
    ChannelTaskRepository,
    ChannelTaskColumnRepository,
    PusherService,
    RmqService,
  ],
})
export class ConversationModule {}
