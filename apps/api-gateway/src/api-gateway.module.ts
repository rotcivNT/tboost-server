import { LoggerModule } from '@app/common';
import { RmqModule } from '@app/common/rmq/rmq.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiGatewayService } from './api-gateway.service';
import {
  AUTH_SERVICE,
  CONVERSATION_SERVICE,
  MESSAGE_SERVICE,
  UPLOAD_SERVICE,
} from './constants/services';
import { ConversationGatewayController } from './conversation-gateway.controller';
import { MessageGatewayController } from './message-gateway.controller';
import { AuthGatewayController } from './auth-gateway.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RmqModule.register({
      name: CONVERSATION_SERVICE,
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
    LoggerModule,
  ],
  controllers: [
    ConversationGatewayController,
    MessageGatewayController,
    AuthGatewayController,
  ],
  providers: [ApiGatewayService],
})
export class ApiGatewayModule {}
