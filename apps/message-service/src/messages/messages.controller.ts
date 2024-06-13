/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FormDataToJsonInterceptor } from '../interceptors';
import { CreateMessageDto } from './dto/create-messate.dto';
import { GetMessageDto } from './dto/get-message-dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessagesService } from './messages.service';
import { DeleteFileMessageDto } from './dto/delete-file-message.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files'), FormDataToJsonInterceptor)
  createNewMessage(
    @Body()
    payload: CreateMessageDto,
  ) {
    return this.messagesService.createMessage(payload);
  }

  @Get()
  getListMessage(@Query() getMessageDto: GetMessageDto) {
    return this.messagesService.getListMessage(
      getMessageDto.channelId,
      getMessageDto.page,
      getMessageDto.pageSize,
    );
  }

  @Post('/update-message')
  updateMessage(@Body() updateMessageDto: UpdateMessageDto) {
    return this.messagesService.updateMessage(updateMessageDto);
  }

  @Post('/forward-message')
  forwardMessage(@Body() payload: CreateMessageDto) {
    return this.messagesService.forwardMessage(payload);
  }

  @Post('/delete-file')
  deleteFileInMessage(@Body() payload: DeleteFileMessageDto) {
    return this.messagesService.deleteFile(payload);
  }
}
