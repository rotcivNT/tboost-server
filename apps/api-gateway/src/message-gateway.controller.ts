import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { FormDataToJsonInterceptor } from 'apps/message-service/src/interceptors';
import { ApiGatewayService } from './api-gateway.service';
import { CreateMeetingMessageDto } from './dtos/message-dto/create-meeting-message.dto';
import { CreateMessageDto } from './dtos/message-dto/create-message.dto';
import { GetMessageDto } from './dtos/message-dto/get-message-dto';
import { UpdateMeetingStatusDto } from './dtos/message-dto/update-meeting-status.dto';
import { UpdateMessageDto } from './dtos/message-dto/update-message.dto';

@Controller('messages')
@ApiTags('Message')
export class MessageGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}
  @Post()
  @UseInterceptors(FilesInterceptor('files'), FormDataToJsonInterceptor)
  createNewMessage(
    @Body()
    payload: CreateMessageDto,
  ) {
    return this.apiGatewayService.createNewMessage(payload);
  }

  @Get()
  getListMessage(@Query() getMessageDto: GetMessageDto) {
    return this.apiGatewayService.getListMessage(getMessageDto);
  }

  @Post(`/update-message`)
  updateMessage(@Body() updateMessageDto: UpdateMessageDto) {
    return this.apiGatewayService.updateMessage(updateMessageDto);
  }

  @Post(`/forward-message`)
  forwardMessage(@Body() createMessageDto: CreateMessageDto) {
    return this.apiGatewayService.forwardMessage(createMessageDto);
  }

  @Post(`/delete-file`)
  deleteFileInMessage(@Body() payload: any) {
    return this.apiGatewayService.deleteFileInMessage(payload);
  }

  @Post(`/new-meeting`)
  createNewMeeting(@Body() payload: CreateMeetingMessageDto) {
    return this.apiGatewayService.createNewMeeting(payload);
  }

  @Post(`/update-meeting`)
  updateMeeting(@Body() payload: UpdateMeetingStatusDto) {
    return this.apiGatewayService.updateMeeting(payload);
  }
}
