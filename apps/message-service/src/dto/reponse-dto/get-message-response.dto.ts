import { ApiResponse } from 'apps/api-gateway/src/types/api-response';
import { ClusterReponse } from '../../types';

export class GetMessageReponseDto implements ApiResponse<ClusterReponse[]> {
  data: ClusterReponse[];
  message: string;
  status: string;
  statusCode: number;
}
