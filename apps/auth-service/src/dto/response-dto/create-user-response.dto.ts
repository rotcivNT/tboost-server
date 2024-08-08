import { ApiResponse } from 'apps/api-gateway/src/types/api-response';
import { User } from 'apps/auth-service/src/schema/user.schema';

export class CreateUserResponseDto implements ApiResponse<User> {
  data: User;
  statusCode: number;
  status: string;
  message: string;
}
