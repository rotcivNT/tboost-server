import { RmqService } from '@app/common/rmq/rmq.service';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { UploadModule } from './upload/upload.module';

async function bootstrap() {
  const app = await NestFactory.create(UploadModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useLogger(app.get(Logger));

  app.setGlobalPrefix('/v1/api');
  app.enableCors();
  const rmqService = app.get<RmqService>(RmqService, { strict: false });
  app.connectMicroservice(rmqService.getOptions('UPLOAD'));
  await app.startAllMicroservices();
  await app.listen(3002);
}
bootstrap();
