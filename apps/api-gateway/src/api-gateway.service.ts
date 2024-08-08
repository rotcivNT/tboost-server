import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ConversationType } from 'apps/conversation-service/src/conversation/types/conversation.type';
import {
  AUTH_SERVICE,
  CONVERSATION_SERVICE,
  MESSAGE_SERVICE,
  UPLOAD_SERVICE,
} from './constants/services';
import { CreateUserDto } from './dtos/auth-dto/create-user.dto';
import { GetUserDto } from './dtos/auth-dto/get-user.dto';
import { BookmarkDto } from './dtos/conversation-dto/channel-dto/create-bookmark.dto';
import { CreateChannelDto } from './dtos/conversation-dto/channel-dto/create-channel.dto';
import { CreateInvitationDto } from './dtos/conversation-dto/channel-dto/create-invitation.dto';
import { DeleteBookmarkDto } from './dtos/conversation-dto/channel-dto/delete-bookmark.dto';
import { GetAllChannelDto } from './dtos/conversation-dto/channel-dto/get-all-channel.dto';
import { RemoveUserDto } from './dtos/conversation-dto/channel-dto/remove-user.dto';
import { UpdateChannelDto } from './dtos/conversation-dto/channel-dto/update-channel.dto';
import { CreateDirectConversationDto } from './dtos/conversation-dto/direct-conversation-dto/create-direct-conversation';
import { CreateMeetingMessageDto } from './dtos/message-dto/create-meeting-message.dto';
import { CreateMessageDto } from './dtos/message-dto/create-messate.dto';
import { DeleteFileMessageDto } from './dtos/message-dto/delete-file-message.dto';
import { GetMessageDto } from './dtos/message-dto/get-message-dto';
import { UpdateMeetingStatusDto } from './dtos/message-dto/update-meeting-status.dto';
import { UpdateMessageDto } from './dtos/message-dto/update-message.dto';
import { UploadFileDto } from './dtos/upload-dto/upload-file.dto';
import { GetDirectConversationDto } from './dtos/conversation-dto/direct-conversation-dto/get-direct-conversation';
import { CreateTaskDto } from './dtos/conversation-dto/task-dto/create-task.dto';
import {
  UpdateStateTaskDto,
  UpdateTaskDto,
} from './dtos/conversation-dto/task-dto/update-task.dto';
import { CreateTaskColumnDto } from './dtos/conversation-dto/task-dto/create-task-column.dto';
import { UpdateTaskColumnDto } from './dtos/conversation-dto/task-dto/update-task-column.dto';
import { UpdateUserDto } from './dtos/auth-dto/update-user.dto';

@Injectable()
export class ApiGatewayService {
  constructor(
    @Inject(CONVERSATION_SERVICE)
    private readonly clientConversation: ClientProxy,
    @Inject(MESSAGE_SERVICE) private readonly clientMessage: ClientProxy,
    @Inject(UPLOAD_SERVICE) private readonly clientUpload: ClientProxy,
    @Inject(AUTH_SERVICE) private readonly clientAuth: ClientProxy,
  ) {}

  // Channel service
  createChannel(createChannelDto: CreateChannelDto) {
    return this.clientConversation.send(
      { cmd: 'create-channel' },
      createChannelDto,
    );
  }

  getAllChannelByUserAndWorkspace(getAllChannelDto: GetAllChannelDto) {
    return this.clientConversation.send(
      { cmd: 'get-all-channel' },
      getAllChannelDto,
    );
  }

  getChannelById(id: string) {
    return this.clientConversation.send({ cmd: 'get-channel-by-id' }, id);
  }

  updateChannel(id: string, updateChannelDto: UpdateChannelDto) {
    return this.clientConversation.send(
      { cmd: 'update-channel' },
      { id, updateChannelDto },
    );
  }

  deleteChannel(id: string) {
    return this.clientConversation.send({ cmd: 'delete-channel' }, id);
  }

  sendInvitationToChannel(createInvitation: CreateInvitationDto) {
    return this.clientConversation.send(
      { cmd: 'send-invitation' },
      createInvitation,
    );
  }

  acceptInvitation(id: string) {
    return this.clientConversation.send({ cmd: 'accept-invitation' }, id);
  }

  createBookmark(channelId: string, bookmarkData: BookmarkDto) {
    const { isFolder, payload, type } = bookmarkData;

    return this.clientConversation.send(
      { cmd: 'create-bookmark' },
      { channelId, isFolder, payload, type },
    );
  }

  updateBookmark(channelId: string, bookmarkData: BookmarkDto) {
    const { isFolder, payload, type } = bookmarkData;
    return this.clientConversation.send(
      { cmd: 'update-bookmark' },
      { channelId, isFolder, payload, type },
    );
  }

  deleteBookmark(channelId: string, bookmarkData: DeleteBookmarkDto) {
    return this.clientConversation.send(
      { cmd: 'delete-bookmark' },
      { channelId, bookmarkData },
    );
  }

  removeUserFromChannel(removeUserDto: RemoveUserDto) {
    return this.clientConversation.send({ cmd: 'remove-user' }, removeUserDto);
  }

  getDirectConversation(getDirectConversationDto: GetDirectConversationDto) {
    return this.clientConversation.send(
      { cmd: 'get-direct-conversation' },
      getDirectConversationDto,
    );
  }

  getDirectConversationById(id: string) {
    return this.clientConversation.send(
      { cmd: 'get-direct-conversation-by-id' },
      id,
    );
  }

  // Message service

  createNewMessage(createMessageDto: CreateMessageDto) {
    return this.clientMessage.send({ cmd: 'create-message' }, createMessageDto);
  }

  getListMessage(getMessageDto: GetMessageDto) {
    return this.clientMessage.send({ cmd: 'get-list-message' }, getMessageDto);
  }

  updateMessage(updateMessageDto: UpdateMessageDto) {
    return this.clientMessage.send({ cmd: 'update-message' }, updateMessageDto);
  }

  forwardMessage(createMessageDto: CreateMessageDto) {
    return this.clientMessage.send(
      { cmd: 'forward-message' },
      createMessageDto,
    );
  }

  deleteFileInMessage(deleleFileDto: DeleteFileMessageDto) {
    return this.clientMessage.send(
      { cmd: 'delete-file-message' },
      deleleFileDto,
    );
  }

  createNewMeeting(createMeetingMessageDto: CreateMeetingMessageDto) {
    return this.clientMessage.emit(
      'create-meeting-message',
      createMeetingMessageDto,
    );
  }

  // Upload service
  uploadFile(files: Express.Multer.File[], uploadFileDto: UploadFileDto) {
    return this.clientUpload.send(
      { cmd: 'upload-files' },
      { files, uploadFileDto },
    );
  }

  updateMeeting(UpdateMeetingStatus: UpdateMeetingStatusDto) {
    return this.clientMessage.emit(
      'update-meeting-status',
      UpdateMeetingStatus,
    );
  }

  // Auth service & Webhook
  createUser(data: any) {
    const createUserDto: CreateUserDto = {
      clerkUserId: data.id,
      email: data.email_addresses[0].email_address,
      firstName: data.first_name,
      lastName: data.last_name,
      fullName: `${data.first_name} ${data.last_name}`,
      imageUrl: data.image_url,
    };

    return this.clientAuth.emit('create-user', createUserDto);
  }

  updateUser(clerkUserId: string, imageUrl: string) {
    const payload: UpdateUserDto = {
      clerkUserId,
      imageUrl,
    };
    return this.clientAuth.emit('update-user', payload);
  }

  async createDirectConversation(data: any) {
    const createDirectConversationDto: CreateDirectConversationDto = {
      workspaceId: data?.organization?.id,
      type: ConversationType.DIRECT_MESSAGE,
      members: [data?.public_user_data?.user_id],
    };
    this.clientConversation.emit(
      'create-direct-conversation',
      createDirectConversationDto,
    );
    return;
  }

  async findUser(getUserDto: GetUserDto) {
    return this.clientAuth.send({ cmd: 'get-user' }, getUserDto);
  }

  async getChannelTask(id: string) {
    return this.clientConversation.send({ cmd: 'get-channel-task' }, id);
  }

  async createTask(createTaskDto: CreateTaskDto) {
    return this.clientConversation.send({ cmd: 'create-task' }, createTaskDto);
  }

  async updateTask(updateTaskDto: UpdateTaskDto) {
    return this.clientConversation.send({ cmd: 'update-task' }, updateTaskDto);
  }

  async updateStateTask(updateStateTaskDto: UpdateStateTaskDto) {
    return this.clientConversation.send(
      { cmd: 'update-task-state' },
      updateStateTaskDto,
    );
  }
  async createTaskColumn(createTaskColumn: CreateTaskColumnDto) {
    return this.clientConversation.send(
      { cmd: 'create-task-column' },
      createTaskColumn,
    );
  }
  async updateTaskColumn(updateTaskColumn: UpdateTaskColumnDto) {
    return this.clientConversation.send(
      { cmd: 'update-task-column' },
      updateTaskColumn,
    );
  }
}
