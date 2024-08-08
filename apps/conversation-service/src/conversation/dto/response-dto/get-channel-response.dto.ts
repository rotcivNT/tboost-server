import { ApiResponse } from 'apps/api-gateway/src/types/api-response';
import { Channel } from 'apps/conversation-service/src/conversation/schema/channel.schema';

export class GetChannelResponseDto implements ApiResponse<Channel | Channel[]> {
  data: Channel | Channel[];
  message: string;
  statusCode: number;
  status: string;
}
