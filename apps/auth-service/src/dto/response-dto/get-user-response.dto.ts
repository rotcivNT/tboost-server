import { ApiResponse } from 'apps/api-gateway/src/types/api-response';
import { User } from 'apps/auth-service/src/schema/user.schema';

export class GetUserResponseDto implements ApiResponse<User[]> {
  statusCode: number;
  status: string;
  data: User[];
  message: string;
}
