/* eslint-disable @typescript-eslint/no-unused-vars */
import { Body, Controller } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from 'apps/api-gateway/src/dtos/message-dto/create-messate.dto';
import { DeleteFileMessageDto } from 'apps/api-gateway/src/dtos/message-dto/delete-file-message.dto';
import { UpdateMessageDto } from 'apps/api-gateway/src/dtos/message-dto/update-message.dto';
import { GetMessageDto } from 'apps/api-gateway/src/dtos/message-dto/get-message-dto';
import { CreateSystemMessageDto } from 'apps/api-gateway/src/dtos/message-dto/CreateSystemMessageDto';
import { CreateMeetingMessageDto } from 'apps/api-gateway/src/dtos/message-dto/create-meeting-message.dto';
import { UpdateMeetingStatusDto } from 'apps/api-gateway/src/dtos/message-dto/update-meeting-status.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @MessagePattern({ cmd: 'create-message' })
  createNewMessage(payload: CreateMessageDto) {
    return this.messagesService.createMessage(payload);
  }

  @MessagePattern({ cmd: 'get-list-message' })
  getListMessage(getMessageDto: GetMessageDto) {
    return this.messagesService.getListMessage(
      getMessageDto.receiverId,
      getMessageDto.beforeId,
      getMessageDto.afterId,
      getMessageDto.aroundId,
    );
  }

  @MessagePattern({ cmd: 'update-message' })
  updateMessage(@Body() updateMessageDto: UpdateMessageDto) {
    return this.messagesService.updateMessage(updateMessageDto);
  }

  @MessagePattern({ cmd: 'forward-message' })
  forwardMessage(@Body() payload: CreateMessageDto) {
    return this.messagesService.forwardMessage(payload);
  }

  @MessagePattern({ cmd: 'delete-file-message' })
  deleteFileInMessage(@Body() payload: DeleteFileMessageDto) {
    return this.messagesService.deleteFile(payload);
  }

  @EventPattern('create-system-message')
  createSystemMessage(createSystemMessageDto: CreateSystemMessageDto) {
    return this.messagesService.createSystemMessage(createSystemMessageDto);
  }

  @EventPattern('create-meeting-message')
  createMeetingMessage(createMeetingMessageDto: CreateMeetingMessageDto) {
    return this.messagesService.createMeetingMessage(createMeetingMessageDto);
  }

  @EventPattern('update-meeting-status')
  updateMeetingStatus(payload: UpdateMeetingStatusDto) {
    return this.messagesService.updateMeetingStatus(payload);
  }
}
