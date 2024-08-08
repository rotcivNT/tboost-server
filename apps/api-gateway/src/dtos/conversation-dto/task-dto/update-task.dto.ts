import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { TaskAttachment } from 'apps/conversation-service/src/conversation/schema/channel-task.schema';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @IsNotEmpty()
  taskId: string;

  @IsOptional()
  attachments: TaskAttachment[];

  @IsOptional()
  cover: string;

  @IsOptional()
  description: string;
}

export class UpdateStateTaskDto {
  @IsNotEmpty()
  taskId: string;

  @IsNotEmpty()
  newStatus: string;

  @IsNotEmpty()
  currentOrder: number;

  @IsNotEmpty()
  newOrder: number;

  @IsNotEmpty()
  channelId: string;
}
