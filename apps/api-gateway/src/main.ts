import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { Logger } from 'nestjs-pino';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ResponseInterceptor } from './interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.setGlobalPrefix('/v1/api');
  const config = new DocumentBuilder()
    .setTitle('TBoost API')
    .setDescription('API for TBoost')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('v1/api/docs', app, document);

  app.useLogger(app.get(Logger));
  app.enableCors();
  await app.listen(3001);
}
bootstrap();
