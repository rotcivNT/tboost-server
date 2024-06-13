import { NestFactory } from '@nestjs/core';
import { UploadModule } from './upload/upload.module';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(UploadModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useLogger(app.get(Logger));
  app.setGlobalPrefix('/v1/api');
  app.enableCors();
  app.connectMicroservice<MicroserviceOptions>({
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
  });
  await app.startAllMicroservices();
  await app.listen(3003);
}
bootstrap();
