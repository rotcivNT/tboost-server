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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ValidationObjectIdPipe } from 'apps/conversation-service/src/pipes/validation-object-id.pipe';
import { ApiGatewayService } from './api-gateway.service';
import { BookmarkDto } from './dtos/conversation-dto/channel-dto/create-bookmark.dto';
import { CreateInvitationDto } from './dtos/conversation-dto/channel-dto/create-invitation.dto';
import { DeleteBookmarkDto } from './dtos/conversation-dto/channel-dto/delete-bookmark.dto';
import { GetAllChannelDto } from './dtos/conversation-dto/channel-dto/get-all-channel.dto';
import { RemoveUserDto } from './dtos/conversation-dto/channel-dto/remove-user.dto';
import { UpdateChannelDto } from './dtos/conversation-dto/channel-dto/update-channel.dto';
import { CreateChannelDto } from './dtos/conversation-dto/channel-dto/create-channel.dto';
import { GetDirectConversationDto } from './dtos/conversation-dto/direct-conversation-dto/get-direct-conversation';
import { CreateTaskDto } from './dtos/conversation-dto/task-dto/create-task.dto';
import {
  UpdateStateTaskDto,
  UpdateTaskDto,
} from './dtos/conversation-dto/task-dto/update-task.dto';
import { CreateTaskColumnDto } from './dtos/conversation-dto/task-dto/create-task-column.dto';
import { UpdateTaskColumnDto } from './dtos/conversation-dto/task-dto/update-task-column.dto';

@Controller('channels')
@ApiTags('Channel')
export class ConversationGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  @Get('/cron-job')
  cronJob() {
    return 'CRON-JOB';
  }
  @Post(`/create-channel`)
  @HttpCode(201)
  create(@Body() createChannelDto: CreateChannelDto) {
    return this.apiGatewayService.createChannel(createChannelDto);
  }

  @Get()
  findAllChannelByUserAndWorkspace(
    @Query() getAllChannelDto: GetAllChannelDto,
  ) {
    return this.apiGatewayService.getAllChannelByUserAndWorkspace(
      getAllChannelDto,
    );
  }

  @Get(`/:id`)
  getChannelById(@Param('id', ValidationObjectIdPipe) id: string) {
    return this.apiGatewayService.getChannelById(id);
  }

  @Patch(`/:id`)
  updateChannel(
    @Param('id', ValidationObjectIdPipe) id: string,
    @Body() updateChannelDto: UpdateChannelDto,
  ) {
    return this.apiGatewayService.updateChannel(id, updateChannelDto);
  }

  @Delete(`/:id`)
  deleteChannel(@Param('id', ValidationObjectIdPipe) id: string) {
    return this.apiGatewayService.deleteChannel(id);
  }

  @Post(`/send-invitation`)
  sendInvitationToChannel(@Body() createInvitation: CreateInvitationDto) {
    return this.apiGatewayService.sendInvitationToChannel(createInvitation);
  }

  @Post(`/accept-invitation/:id`)
  acceptInvitation(@Param('id', ValidationObjectIdPipe) id: string) {
    return this.apiGatewayService.acceptInvitation(id);
  }

  @Post(`/add-bookmark/:id`)
  handleAddBookmark(
    @Param('id', ValidationObjectIdPipe) id: string,
    @Body() data: BookmarkDto,
  ) {
    return this.apiGatewayService.createBookmark(id, data);
  }

  @Post(`/update-bookmark/:id`)
  handleUpdateBookmark(
    @Param('id', ValidationObjectIdPipe) id: string,
    @Body() data: BookmarkDto,
  ) {
    return this.apiGatewayService.updateBookmark(id, data);
  }

  @Post(`/delete-bookmark/:id`)
  handleDeleteBookmark(
    @Param('id', ValidationObjectIdPipe) id: string,
    @Body() bookmarkData: DeleteBookmarkDto,
  ) {
    return this.apiGatewayService.deleteBookmark(id, bookmarkData);
  }

  @Post(`/remove-user`)
  removeUserFromChannel(@Body() removeUserDto: RemoveUserDto) {
    return this.apiGatewayService.removeUserFromChannel(removeUserDto);
  }

  @Post('/get-direct-conversation')
  getDirectConversation(
    @Body() getDirectConversationDto: GetDirectConversationDto,
  ) {
    return this.apiGatewayService.getDirectConversation(
      getDirectConversationDto,
    );
  }

  @Get('/get-direct-conversation/:id')
  getDirectConversationById(@Param('id', ValidationObjectIdPipe) id: string) {
    return this.apiGatewayService.getDirectConversationById(id);
  }

  @Get('/get-task/:id')
  getChannelTask(@Param('id', ValidationObjectIdPipe) id: string) {
    return this.apiGatewayService.getChannelTask(id);
  }

  @Post('/create-task')
  createTask(@Body() createTaskDto: CreateTaskDto) {
    return this.apiGatewayService.createTask(createTaskDto);
  }

  @Post('/update-task')
  updateTask(@Body() updateTaskDto: UpdateTaskDto) {
    return this.apiGatewayService.updateTask(updateTaskDto);
  }

  @Post('/update-task-state')
  updateStateTask(@Body() updateStateTaskDto: UpdateStateTaskDto) {
    return this.apiGatewayService.updateStateTask(updateStateTaskDto);
  }

  @Post('/create-task-column')
  createTaskColumn(@Body() createTaskColumnDto: CreateTaskColumnDto) {
    return this.apiGatewayService.createTaskColumn(createTaskColumnDto);
  }

  @Post('/update-task-column')
  updateTaskColumn(@Body() updateTaskColumnDto: UpdateTaskColumnDto) {
    return this.apiGatewayService.updateTaskColumn(updateTaskColumnDto);
  }
}
