import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateChannelDto } from 'apps/channel-service/src/channels/dto/create-channel.dto';
import { ValidationObjectIdPipe } from 'apps/channel-service/src/channels/pipes/validation-object-id.pipe';
import { FormDataToJsonInterceptor } from 'apps/message-service/src/interceptors';
import { ApiGatewayService } from './api-gateway.service';
import { CLERK_WEBHOOK_EVENT_TYPE } from './constants';
import { PREFIX_CHANNEL, PREFIX_MESSAGE } from './constants/prefixRoute';
import { BookmarkDto } from './dtos/channel-dto/create-bookmark.dto';
import { CreateInvitationDto } from './dtos/channel-dto/create-invitation.dto';
import { DeleteBookmarkDto } from './dtos/channel-dto/delete-bookmark.dto';
import { GetAllChannelDto } from './dtos/channel-dto/get-all-channel.dto';
import { RemoveUserDto } from './dtos/channel-dto/remove-user.dto';
import { UpdateChannelDto } from './dtos/channel-dto/update-channel.dto';
import { CreateMeetingMessageDto } from './dtos/message-dto/create-meeting-message.dto';
import { CreateMessageDto } from './dtos/message-dto/create-messate.dto';
import { GetMessageDto } from './dtos/message-dto/get-message-dto';
import { UpdateMeetingStatusDto } from './dtos/message-dto/update-meeting-status.dto';
import { UpdateMessageDto } from './dtos/message-dto/update-message.dto';
import { ClerkWebhookInterceptor } from './interceptors/clerk-webhook.interceptor';

@Controller()
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  // Channel service
  @Post(`${PREFIX_CHANNEL}/create-channel`)
  @HttpCode(201)
  create(@Body() createChannelDto: CreateChannelDto) {
    console.log(createChannelDto);
    return this.apiGatewayService.createChannel(createChannelDto);
  }

  @Get(`${PREFIX_CHANNEL}`)
  findAllChannelByUserAndWorkspace(
    @Query() getAllChannelDto: GetAllChannelDto,
  ) {
    return this.apiGatewayService.getAllChannelByUserAndWorkspace(
      getAllChannelDto,
    );
  }

  @Get(`${PREFIX_CHANNEL}/:id`)
  getChannelById(@Param('id', ValidationObjectIdPipe) id: string) {
    return this.apiGatewayService.getChannelById(id);
  }

  @Patch(`${PREFIX_CHANNEL}/:id`)
  updateChannel(
    @Param('id', ValidationObjectIdPipe) id: string,
    @Body() updateChannelDto: UpdateChannelDto,
  ) {
    return this.apiGatewayService.updateChannel(id, updateChannelDto);
  }

  @Delete(`${PREFIX_CHANNEL}/:id`)
  deleteChannel(@Param('id', ValidationObjectIdPipe) id: string) {
    return this.apiGatewayService.deleteChannel(id);
  }

  @Post(`${PREFIX_CHANNEL}/send-invitation`)
  sendInvitationToChannel(@Body() createInvitation: CreateInvitationDto) {
    return this.apiGatewayService.sendInvitationToChannel(createInvitation);
  }

  @Post(`${PREFIX_CHANNEL}/accept-invitation/:id`)
  acceptInvitation(@Param('id', ValidationObjectIdPipe) id: string) {
    return this.apiGatewayService.acceptInvitation(id);
  }

  @Post(`${PREFIX_CHANNEL}/add-bookmark/:id`)
  handleAddBookmark(
    @Param('id', ValidationObjectIdPipe) id: string,
    @Body() data: BookmarkDto,
  ) {
    return this.apiGatewayService.createBookmark(id, data);
  }

  @Post(`${PREFIX_CHANNEL}/update-bookmark/:id`)
  handleUpdateBookmark(
    @Param('id', ValidationObjectIdPipe) id: string,
    @Body() data: BookmarkDto,
  ) {
    return this.apiGatewayService.updateBookmark(id, data);
  }

  @Post(`${PREFIX_CHANNEL}/delete-bookmark/:id`)
  handleDeleteBookmark(
    @Param('id', ValidationObjectIdPipe) id: string,
    @Body() bookmarkData: DeleteBookmarkDto,
  ) {
    return this.apiGatewayService.deleteBookmark(id, bookmarkData);
  }

  @Post(`${PREFIX_CHANNEL}/remove-user`)
  removeUserFromChannel(@Body() removeUserDto: RemoveUserDto) {
    return this.apiGatewayService.removeUserFromChannel(removeUserDto);
  }

  // Message service
  @Post(`${PREFIX_MESSAGE}`)
  @UseInterceptors(FilesInterceptor('files'), FormDataToJsonInterceptor)
  createNewMessage(
    @Body()
    payload: CreateMessageDto,
  ) {
    return this.apiGatewayService.createNewMessage(payload);
  }

  @Get(`${PREFIX_MESSAGE}`)
  getListMessage(@Query() getMessageDto: GetMessageDto) {
    return this.apiGatewayService.getListMessage(getMessageDto);
  }

  @Post(`${PREFIX_MESSAGE}/update-message`)
  updateMessage(@Body() updateMessageDto: UpdateMessageDto) {
    return this.apiGatewayService.updateMessage(updateMessageDto);
  }

  @Post(`${PREFIX_MESSAGE}/forward-message`)
  forwardMessage(@Body() createMessageDto: CreateMessageDto) {
    return this.apiGatewayService.forwardMessage(createMessageDto);
  }

  @Post(`${PREFIX_MESSAGE}/delete-file`)
  deleteFileInMessage(@Body() payload: any) {
    return this.apiGatewayService.deleteFileInMessage(payload);
  }

  @Post(`${PREFIX_MESSAGE}/new-meeting`)
  createNewMeeting(@Body() payload: CreateMeetingMessageDto) {
    return this.apiGatewayService.createNewMeeting(payload);
  }

  @Post(`${PREFIX_MESSAGE}/update-meeting`)
  updateMeeting(@Body() payload: UpdateMeetingStatusDto) {
    return this.apiGatewayService.updateMeeting(payload);
  }

  // Upload service

  // Auth service & Clerk Webhook
  @Post('webhooks')
  @UseInterceptors(ClerkWebhookInterceptor)
  async handleWebhookEvent(@Body() payload: any) {
    if (payload?.type === CLERK_WEBHOOK_EVENT_TYPE.USER_CREATED) {
      this.apiGatewayService.createUser(payload.data);
    }
    return;
  }
}
