import { NestFactory } from '@nestjs/core';
import { ChannelsModule } from './channels/channels.module';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(ChannelsModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useLogger(app.get(Logger));
  app.setGlobalPrefix('/v1/api');
  app.enableCors();
  await app.listen(3001);
}
bootstrap();
