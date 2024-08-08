import { HttpStatus } from '@nestjs/common';
import { ApiResponse } from '../../types/api-response';
import { ApiStatus } from '../../types/api-status';

export class InternalServerErrorDto implements ApiResponse<null> {
  readonly data: null;
  readonly message: string;
  readonly statusCode: number;
  readonly status: string;

  constructor() {
    this.data = null;
    this.message = 'Internal server error';
    this.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    this.status = ApiStatus.ERROR;
  }
}
