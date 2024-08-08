import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiGatewayService } from './api-gateway.service';
import { CLERK_WEBHOOK_EVENT_TYPE } from './constants';
import { GetUserDto } from './dtos/auth-dto/get-user.dto';
import { ClerkWebhookInterceptor } from './interceptors/clerk-webhook.interceptor';

@Controller('auths')
@ApiTags('Auth')
export class AuthGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}
  @Post('webhooks')
  @UseInterceptors(ClerkWebhookInterceptor)
  async handleWebhookEvent(@Body() payload: any) {
    if (payload?.type === CLERK_WEBHOOK_EVENT_TYPE.USER_CREATED) {
      this.apiGatewayService.createUser(payload.data);
      return;
    }

    if (
      payload?.type === CLERK_WEBHOOK_EVENT_TYPE.ORGANIZATION_MEMBER_CREATED
    ) {
      this.apiGatewayService.createDirectConversation(payload.data);
      return;
    }

    if (payload?.type === CLERK_WEBHOOK_EVENT_TYPE.USER_UPDATED) {
      this.apiGatewayService.updateUser(
        payload.data.id,
        payload.data.image_url,
      );
      return;
    }
  }

  @Post('/get-user')
  async findUser(@Body() getUserDto: GetUserDto) {
    return this.apiGatewayService.findUser(getUserDto);
  }
}
