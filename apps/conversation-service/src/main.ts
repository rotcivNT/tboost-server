import { RmqService } from '@app/common/rmq/rmq.service';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { ConversationModule } from './conversation.module';

async function bootstrap() {
  const app = await NestFactory.create(ConversationModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useLogger(app.get(Logger));
  const rmqService = app.get<RmqService>(RmqService, { strict: false });
  app.connectMicroservice(rmqService.getOptions('CONVERSATION'));
  await app.startAllMicroservices();
  await app.listen(3004);
}
bootstrap();
