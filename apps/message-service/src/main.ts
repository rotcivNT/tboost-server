import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { RmqService } from '@app/common/rmq/rmq.service';
import { MessagesModule } from './messages.module';

async function bootstrap() {
  const app = await NestFactory.create(MessagesModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useLogger(app.get(Logger));

  const rmqService = app.get<RmqService>(RmqService, { strict: false });
  app.connectMicroservice(rmqService.getOptions('MESSAGE'));
  await app.startAllMicroservices();
  await app.listen(3005);
}
bootstrap();
