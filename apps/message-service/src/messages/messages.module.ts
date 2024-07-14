import { LoggerModule } from '@app/common';
import { DatabaseModule } from '@app/common/database/database.module';
import { PusherModule } from '@app/common/pusher/pusher.module';
import { RmqModule } from '@app/common/rmq/rmq.module';
import { RmqService } from '@app/common/rmq/rmq.service';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AUTH_SERVICE,
  CHANNEL_SERVICE,
  UPLOAD_SERVICE,
} from 'apps/api-gateway/src/constants/services';
import { MessageItemRepository } from './message-item.repository';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { MessageItem, MessageItemSchema } from './schema/message.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/message-service/.env',
    }),
    DatabaseModule.register({ connectionName: 'MESSAGE' }),
    MongooseModule.forFeature([
      {
        name: MessageItem.name,
        schema: MessageItemSchema,
      },
    ]),
    LoggerModule,
    PusherModule,
    RmqModule.register({
      name: CHANNEL_SERVICE,
    }),
    RmqModule.register({
      name: UPLOAD_SERVICE,
    }),
    RmqModule.register({
      name: AUTH_SERVICE,
    }),
  ],
  controllers: [MessagesController],
  providers: [MessagesService, MessageItemRepository, RmqService],
})
export class MessagesModule {}
