import { RmqService } from '@app/common/rmq/rmq.service';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { ChannelsModule } from './channels/channels.module';

async function bootstrap() {
  const app = await NestFactory.create(ChannelsModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useLogger(app.get(Logger));
  const rmqService = app.get<RmqService>(RmqService, { strict: false });
  app.connectMicroservice(rmqService.getOptions('CHANNEL'));
  await app.startAllMicroservices();
}
bootstrap();
