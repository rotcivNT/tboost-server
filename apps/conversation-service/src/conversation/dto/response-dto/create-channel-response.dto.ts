import { ApiResponse } from 'apps/api-gateway/src/types/api-response';
import { Channel } from 'apps/conversation-service/src/conversation/schema/channel.schema';

export class CreateChannelResponseDto implements ApiResponse<Channel> {
  data: Channel;
  message: string;
  statusCode: number;
  status: string;
}
