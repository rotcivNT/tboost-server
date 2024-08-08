import { ApiResponse } from 'apps/api-gateway/src/types/api-response';

export class DeleteChannelResponseDto implements ApiResponse<null> {
  data: null;
  message: string;
  statusCode: number;
  status: string;
}
