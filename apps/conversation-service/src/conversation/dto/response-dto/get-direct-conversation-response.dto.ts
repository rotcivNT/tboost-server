import { ApiResponse } from 'apps/api-gateway/src/types/api-response';
import { DirectConversation } from '../../schema/direct-conversation.schema';
import { User } from 'apps/auth-service/src/schema/user.schema';

export type DCResponseData = {
  membersInfo: User[];
} & DirectConversation;

export class GetDirectConversationResponseDto
  implements ApiResponse<DirectConversation[]>
{
  data: DCResponseData[];
  message: string;
  status: string;
  statusCode: number;
}
