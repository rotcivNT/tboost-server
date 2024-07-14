import { PusherService } from '@app/common/pusher/pusher.service';
import { Controller, Inject, Param } from '@nestjs/common';
import {
  ClientProxy,
  EventPattern,
  MessagePattern,
} from '@nestjs/microservices';
import { MESSAGE_SERVICE } from 'apps/api-gateway/src/constants/services';
import { CreateChannelDto } from 'apps/api-gateway/src/dtos/channel-dto/create-channel.dto';
import { GetAllChannelDto } from 'apps/api-gateway/src/dtos/channel-dto/get-all-channel.dto';
import { RemoveUserDto } from 'apps/api-gateway/src/dtos/channel-dto/remove-user.dto';
import { CreateSystemMessageDto } from 'apps/api-gateway/src/dtos/message-dto/CreateSystemMessageDto';
import { ChannelsService } from './channels.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { ValidationObjectIdPipe } from './pipes/validation-object-id.pipe';
import { MessageType } from 'apps/api-gateway/src/constants';
@Controller('channels')
export class ChannelsController {
  constructor(
    private readonly channelsService: ChannelsService,
    private pusherService: PusherService,
    @Inject(MESSAGE_SERVICE) private clientMessage: ClientProxy,
  ) {}

  @MessagePattern({ cmd: 'create-channel' })
  create(createChannelDto: CreateChannelDto) {
    return this.channelsService.createChannel(createChannelDto);
  }

  @MessagePattern({ cmd: 'get-all-channel' })
  findAll(queries: GetAllChannelDto) {
    const { workspaceId, userId } = queries;
    return this.channelsService.findAll(workspaceId, userId);
  }

  @MessagePattern({ cmd: 'get-channel-by-id' })
  findOne(id: string) {
    return this.channelsService.findOne(id);
  }

  @MessagePattern({ cmd: 'update-channel' })
  async update({
    id,
    updateChannelDto,
  }: {
    id: string;
    updateChannelDto: UpdateChannelDto;
  }) {
    const updatedDoc = await this.channelsService.update(id, updateChannelDto);
    if (updatedDoc._id) {
      await this.pusherService.trigger(
        id,
        'update-channel',
        updatedDoc,
        updateChannelDto.socketId,
      );
    }
    return updatedDoc;
  }

  @MessagePattern({ cmd: 'delete-channel' })
  remove(@Param('id', ValidationObjectIdPipe) id: string) {
    return this.channelsService.remove(id);
  }

  @MessagePattern({ cmd: 'send-invitation' })
  sendInvitationToChannel(createInvitation: CreateInvitationDto) {
    return this.channelsService.sendInvitationToChannel(createInvitation);
  }

  @MessagePattern({ cmd: 'accept-invitation' })
  async acceptInvitation(id: string) {
    const res = await this.channelsService.acceptInvitation(id);

    if (res.code === 1) {
      const createSystemMessageDto: CreateSystemMessageDto = {
        content: 'member.joined',
        channelId: res.channelId,
        senderId: res.newMemberId,
        type: MessageType.SYSTEM,
      };
      this.clientMessage.emit('create-system-message', createSystemMessageDto);

      await this.pusherService.trigger(
        res.data.channelId,
        'new-member-joined',
        res,
      );
    }
    return res;
  }

  @EventPattern('message-delivery')
  async handleNewMessage(data: any) {
    if (data) {
      try {
        if (data?.type === 'update') {
          await this.pusherService.trigger(
            data.channelId,
            'update-message',
            data.message,
            data.socketId,
          );
        } else
          await this.pusherService.trigger(
            data.channelId,
            'new-message',
            data.message,
            data.socketId,
          );
      } catch (e) {
        console.log(e);
      }
    }
  }

  @MessagePattern({ cmd: 'create-bookmark' })
  async handleAddBookmark(data: any) {
    const { channelId, isFolder, payload } = data;
    try {
      const res = await this.channelsService.createBookmark(
        channelId,
        isFolder,
        payload,
      );
      this.pusherService.trigger(channelId, 'add-bookmark', res);
      return res;
    } catch (e) {
      return e;
    }
  }

  @MessagePattern({ cmd: 'update-bookmark' })
  async handleUpdateBookmark(data: any) {
    const { channelId, isFolder, payload } = data;
    try {
      const res = await this.channelsService.updateBookmark(
        channelId,
        isFolder,
        payload,
      );
      this.pusherService.trigger(channelId, 'add-bookmark', res);
      return res;
    } catch (e) {
      return e;
    }
  }

  @MessagePattern({ cmd: 'delete-bookmark' })
  async handleDeleteBookmark(data: any) {
    const { channelId, bookmarkData } = data;

    try {
      const res = await this.channelsService.deleteBookmark(
        channelId,
        bookmarkData,
      );
      this.pusherService.trigger(channelId, 'add-bookmark', res);
      return res;
    } catch (e) {
      return e;
    }
  }

  @MessagePattern({ cmd: 'remove-user' })
  async removeUserFromChannel(deleteUserDto: RemoveUserDto) {
    try {
      const res =
        await this.channelsService.removeUserFromChannel(deleteUserDto);
      this.pusherService.trigger(deleteUserDto.channelId, 'remove-user', res);
      this.pusherService.trigger(deleteUserDto.deleteId, 'remove-user', res);
      return res;
    } catch (e) {
      console.log(e);
    }
  }
}
