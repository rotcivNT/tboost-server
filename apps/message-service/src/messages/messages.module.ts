import { LoggerModule } from '@app/common';
import { PusherModule } from '@app/common/pusher/pusher.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageItemRepository } from './message-item.repository';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { MessageItem, MessageItemSchema } from './schema/message.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'apps/message-service/.env',
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
        name: MessageItem.name,
        schema: MessageItemSchema,
      },
    ]),
    LoggerModule,
    PusherModule,
    ClientsModule.register([
      {
        name: 'CHANNEL_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            'amqps://xhpelvkj:DBe1xj69AqNJPfuqv0CYilF1z8ObnFvO@octopus.rmq3.cloudamqp.com/xhpelvkj',
          ],
          queue: 'channel_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: 'UPLOAD_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            'amqps://xhpelvkj:DBe1xj69AqNJPfuqv0CYilF1z8ObnFvO@octopus.rmq3.cloudamqp.com/xhpelvkj',
          ],
          queue: 'upload_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [MessagesController],
  providers: [MessagesService, MessageItemRepository],
})
export class MessagesModule {}
