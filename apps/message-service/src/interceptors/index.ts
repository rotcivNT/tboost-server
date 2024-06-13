import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class FormDataToJsonInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Chuyển đổi form-data thành JSON
    if (request.is('multipart/form-data')) {
      const formData = request.body;
      const payload = JSON.parse(formData.payload);
      request.body = payload;
    }

    return next.handle().pipe(map((data) => data));
  }
}
