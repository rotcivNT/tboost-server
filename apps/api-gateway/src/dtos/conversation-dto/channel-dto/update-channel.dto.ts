import { PartialType } from '@nestjs/mapped-types';
import { CreateChannelDto } from './create-channel.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdateChannelDto extends PartialType(CreateChannelDto) {
  @IsNotEmpty()
  socketId: string;
}
