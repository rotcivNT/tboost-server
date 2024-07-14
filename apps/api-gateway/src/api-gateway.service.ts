import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  AUTH_SERVICE,
  CHANNEL_SERVICE,
  MESSAGE_SERVICE,
  UPLOAD_SERVICE,
} from './constants/services';
import { CreateUserDto } from './dtos/auth-dto/create-user.dto';
import { BookmarkDto } from './dtos/channel-dto/create-bookmark.dto';
import { CreateChannelDto } from './dtos/channel-dto/create-channel.dto';
import { CreateInvitationDto } from './dtos/channel-dto/create-invitation.dto';
import { DeleteBookmarkDto } from './dtos/channel-dto/delete-bookmark.dto';
import { GetAllChannelDto } from './dtos/channel-dto/get-all-channel.dto';
import { RemoveUserDto } from './dtos/channel-dto/remove-user.dto';
import { UpdateChannelDto } from './dtos/channel-dto/update-channel.dto';
import { CreateMeetingMessageDto } from './dtos/message-dto/create-meeting-message.dto';
import { CreateMessageDto } from './dtos/message-dto/create-messate.dto';
import { DeleteFileMessageDto } from './dtos/message-dto/delete-file-message.dto';
import { GetMessageDto } from './dtos/message-dto/get-message-dto';
import { UpdateMeetingStatusDto } from './dtos/message-dto/update-meeting-status.dto';
import { UpdateMessageDto } from './dtos/message-dto/update-message.dto';
import { UploadFileDto } from './dtos/upload-dto/upload-file.dto';

@Injectable()
export class ApiGatewayService {
  constructor(
    @Inject(CHANNEL_SERVICE) private readonly clientChannel: ClientProxy,
    @Inject(MESSAGE_SERVICE) private readonly clientMessage: ClientProxy,
    @Inject(UPLOAD_SERVICE) private readonly clientUpload: ClientProxy,
    @Inject(AUTH_SERVICE) private readonly clientAuth: ClientProxy,
  ) {}

  // Channel service
  createChannel(createChannelDto: CreateChannelDto) {
    return this.clientChannel.send({ cmd: 'create-channel' }, createChannelDto);
  }

  getAllChannelByUserAndWorkspace(getAllChannelDto: GetAllChannelDto) {
    return this.clientChannel.send(
      { cmd: 'get-all-channel' },
      getAllChannelDto,
    );
  }

  getChannelById(id: string) {
    return this.clientChannel.send({ cmd: 'get-channel-by-id' }, id);
  }

  updateChannel(id: string, updateChannelDto: UpdateChannelDto) {
    return this.clientChannel.send(
      { cmd: 'update-channel' },
      { id, updateChannelDto },
    );
  }

  deleteChannel(id: string) {
    return this.clientChannel.send({ cmd: 'delete-channel' }, id);
  }

  sendInvitationToChannel(createInvitation: CreateInvitationDto) {
    return this.clientChannel.send(
      { cmd: 'send-invitation' },
      createInvitation,
    );
  }

  acceptInvitation(id: string) {
    return this.clientChannel.send({ cmd: 'accept-invitation' }, id);
  }

  createBookmark(channelId, bookmarkData: BookmarkDto) {
    const { isFolder, payload } = bookmarkData;
    return this.clientChannel.send(
      { cmd: 'create-bookmark' },
      { channelId, isFolder, payload },
    );
  }

  updateBookmark(channelId: string, bookmarkData: BookmarkDto) {
    const { isFolder, payload } = bookmarkData;
    return this.clientChannel.send(
      { cmd: 'update-bookmark' },
      { channelId, isFolder, payload },
    );
  }

  deleteBookmark(channelId: string, bookmarkData: DeleteBookmarkDto) {
    return this.clientChannel.send(
      { cmd: 'delete-bookmark' },
      { channelId, bookmarkData },
    );
  }

  removeUserFromChannel(removeUserDto: RemoveUserDto) {
    return this.clientChannel.send({ cmd: 'remove-user' }, removeUserDto);
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
}
