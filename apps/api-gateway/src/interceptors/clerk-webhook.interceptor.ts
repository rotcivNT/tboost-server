import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Webhook } from 'svix';

@Injectable()
export class ClerkWebhookInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const headers = req.headers;
    const payload = req.body;
    // Get the Svix headers for verification
    const svix_id = headers['svix-id'];
    const svix_timestamp = headers['svix-timestamp'];
    const svix_signature = headers['svix-signature'];
    // If there are no Svix headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      throw new BadRequestException({
        message: 'Missing required headers',
      });
    }
    // Create a new Svix instance with your secret.
    const wh = new Webhook('whsec_mBKNeBUc3O2Km5VTV5v69X9ydShqDgb3');
    try {
      wh.verify(JSON.stringify(payload), {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      });
      return next.handle();
    } catch (err) {
      console.log('Error verifying webhook:', err.message);
      throw new BadRequestException({
        message: 'Error verifying webhook',
        error: err.message,
      });
    }
  }
}
