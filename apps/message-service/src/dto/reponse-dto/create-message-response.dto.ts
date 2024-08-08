import { ApiResponse } from 'apps/api-gateway/src/types/api-response';
import { MessageResponse } from '../../types';

export class CreateMessageResponseDto implements ApiResponse<MessageResponse> {
  data: MessageResponse;
  message: string;
  status: string;
  statusCode: number;
}
