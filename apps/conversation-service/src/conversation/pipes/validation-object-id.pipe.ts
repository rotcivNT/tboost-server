import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class ValidationObjectIdPipe implements PipeTransform {
  transform(value: string) {
    if (isValidObjectId(value)) return value;
    throw new BadRequestException('Invalid ObjectId');
  }
}
