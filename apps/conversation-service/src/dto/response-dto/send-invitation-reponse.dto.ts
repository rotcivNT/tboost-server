import { ApiResponse } from 'apps/api-gateway/src/types/api-response';
import { ChannelInvitation } from 'apps/conversation-service/src/schema/channel-invitation.schema';

export class SendInvitationReponseDto
  implements ApiResponse<ChannelInvitation>
{
  data: ChannelInvitation;
  message: string;
  statusCode: number;
  status: string;
}
