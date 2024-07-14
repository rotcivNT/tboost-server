import { RmqModule } from '@app/common/rmq/rmq.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import {
  AUTH_SERVICE,
  CHANNEL_SERVICE,
  MESSAGE_SERVICE,
  UPLOAD_SERVICE,
} from './constants/services';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RmqModule.register({
      name: CHANNEL_SERVICE,
    }),
    RmqModule.register({
      name: MESSAGE_SERVICE,
    }),
    RmqModule.register({
      name: UPLOAD_SERVICE,
    }),
    RmqModule.register({
      name: AUTH_SERVICE,
    }),
  ],
  controllers: [ApiGatewayController],
  providers: [ApiGatewayService],
})
export class ApiGatewayModule {}
