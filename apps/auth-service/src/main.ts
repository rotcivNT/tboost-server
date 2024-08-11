import { NestFactory } from '@nestjs/core';
import { AuthsModule } from './auths.module';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { RmqService } from '@app/common/rmq/rmq.service';

async function bootstrap() {
  const app = await NestFactory.create(AuthsModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useLogger(app.get(Logger));
  const rmqService = app.get<RmqService>(RmqService, { strict: false });
  app.connectMicroservice(rmqService.getOptions('AUTH'));
  await app.startAllMicroservices();
  await app.listen(3003);
}
bootstrap();
