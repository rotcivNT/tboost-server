import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../types/api-response';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((res) => {
        context.switchToHttp().getResponse().statusCode =
          res?.statusCode || context.switchToHttp().getResponse().statusCode;
        if (!res) return null;
        return {
          statusCode: context.switchToHttp().getResponse().statusCode,
          status: res.status,
          message: res.message,
          data: res.data,
        };
      }),
    );
  }
}
