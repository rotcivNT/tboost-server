import { ApiResponse } from 'apps/api-gateway/src/types/api-response';
import { Channel } from '../../schema/channel.schema';
import { DirectConversation } from '../../schema/direct-conversation.schema';

export class CreateBookmarkResponseDto
  implements ApiResponse<DirectConversation | Channel>
{
  data: DirectConversation | Channel;
  message: string;
  statusCode: number;
  status: string;
}
