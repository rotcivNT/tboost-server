import { PusherService } from '@app/common/pusher/pusher.service';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { Controller, HttpStatus, Inject, Param } from '@nestjs/common';
import {
  ClientProxy,
  EventPattern,
  MessagePattern,
} from '@nestjs/microservices';
import { MessageType } from 'apps/api-gateway/src/constants';
import {
  AUTH_SERVICE,
  MESSAGE_SERVICE,
} from 'apps/api-gateway/src/constants/services';
import {
  FindBy,
  GetUserDto,
} from 'apps/api-gateway/src/dtos/auth-dto/get-user.dto';
import { InternalServerErrorDto } from 'apps/api-gateway/src/dtos/common-dto/InternalServerError.dto';
import { CreateChannelDto } from 'apps/api-gateway/src/dtos/conversation-dto/channel-dto/create-channel.dto';
import { CreateInvitationDto } from 'apps/api-gateway/src/dtos/conversation-dto/channel-dto/create-invitation.dto';
import { GetAllChannelDto } from 'apps/api-gateway/src/dtos/conversation-dto/channel-dto/get-all-channel.dto';
import { RemoveUserDto } from 'apps/api-gateway/src/dtos/conversation-dto/channel-dto/remove-user.dto';
import { UpdateChannelDto } from 'apps/api-gateway/src/dtos/conversation-dto/channel-dto/update-channel.dto';
import { CreateDirectConversationDto } from 'apps/api-gateway/src/dtos/conversation-dto/direct-conversation-dto/create-direct-conversation';
import { GetDirectConversationDto } from 'apps/api-gateway/src/dtos/conversation-dto/direct-conversation-dto/get-direct-conversation';
import { CreateSystemMessageDto } from 'apps/api-gateway/src/dtos/message-dto/CreateSystemMessageDto';
import { ApiStatus } from 'apps/api-gateway/src/types/api-status';
import { GetUserResponseDto } from 'apps/auth-service/src/dto/response-dto/get-user-response.dto';
import { User } from 'apps/auth-service/src/schema/user.schema';
import { AcceptInvitationResponseDto } from 'apps/conversation-service/src/conversation/dto/response-dto/accept-invitation-response.dto';
import { lastValueFrom } from 'rxjs';
import { ConversationsService } from './conversation.service';
import { ValidationObjectIdPipe } from './pipes/validation-object-id.pipe';
import { CreateTaskDto } from 'apps/api-gateway/src/dtos/conversation-dto/task-dto/create-task.dto';
import {
  UpdateStateTaskDto,
  UpdateTaskDto,
} from 'apps/api-gateway/src/dtos/conversation-dto/task-dto/update-task.dto';
import { CreateTaskColumnDto } from 'apps/api-gateway/src/dtos/conversation-dto/task-dto/create-task-column.dto';
import { UpdateTaskColumnDto } from 'apps/api-gateway/src/dtos/conversation-dto/task-dto/update-task-column.dto';
@Controller('channels')
export class ConversationsController {
  constructor(
    private readonly conversationsService: ConversationsService,
    private pusherService: PusherService,
    @Inject(MESSAGE_SERVICE) private clientMessage: ClientProxy,
    @Inject(AUTH_SERVICE) private clientAuth: ClientProxy,
  ) {}

  @MessagePattern({ cmd: 'create-channel' })
  async create(createChannelDto: CreateChannelDto) {
    try {
      const res =
        await this.conversationsService.createChannel(createChannelDto);
      if (
        createChannelDto.isPublic &&
        createChannelDto.addAllMember &&
        res.status === ApiStatus.OK
      ) {
        const users: GetUserResponseDto = await lastValueFrom(
          this.clientAuth.send({ cmd: 'get-all-users' }, {}),
        );
        if (users.status === ApiStatus.OK) {
          const promises = users.data.map((user: User) => {
            if (user.clerkUserId === createChannelDto.creatorID) return;
            return this.conversationsService.addMemberToChannel(
              res.data._id,
              user.clerkUserId,
            );
          });
          await Promise.allSettled(promises);
        }
      }
      return res;
    } catch (e) {
      return new InternalServerErrorDto();
    }
  }

  @MessagePattern({ cmd: 'get-all-channel' })
  findAll(queries: GetAllChannelDto) {
    try {
      const { workspaceId, userId } = queries;
      return this.conversationsService.findAll(workspaceId, userId);
    } catch (e) {
      return new InternalServerErrorDto();
    }
  }

  @MessagePattern({ cmd: 'get-channel-by-id' })
  findOne(id: string) {
    try {
      return this.conversationsService.findOne(id);
    } catch (e) {
      return new InternalServerErrorDto();
    }
  }

  @MessagePattern({ cmd: 'update-channel' })
  async update({
    id,
    updateChannelDto,
  }: {
    id: string;
    updateChannelDto: UpdateChannelDto;
  }) {
    try {
      const res = await this.conversationsService.update(id, updateChannelDto);
      if (res.data._id) {
        await this.pusherService.trigger(
          id,
          'update-channel',
          res.data,
          updateChannelDto.socketId,
        );
      }
      return res;
    } catch (e) {
      return new InternalServerErrorDto();
    }
  }

  @MessagePattern({ cmd: 'delete-channel' })
  remove(@Param('id', ValidationObjectIdPipe) id: string) {
    try {
      return this.conversationsService.remove(id);
    } catch (e) {
      return new InternalServerErrorDto();
    }
  }

  @MessagePattern({ cmd: 'send-invitation' })
  sendInvitationToChannel(createInvitation: CreateInvitationDto) {
    try {
      return this.conversationsService.sendInvitationToChannel(
        createInvitation,
      );
    } catch (e) {
      return new InternalServerErrorDto();
    }
  }

  @MessagePattern({ cmd: 'accept-invitation' })
  async acceptInvitation(id: string): Promise<AcceptInvitationResponseDto> {
    try {
      const res = await this.conversationsService.acceptInvitation(id);

      if (res.statusCode === HttpStatus.ACCEPTED) {
        const users = await clerkClient.users.getUserList({
          emailAddress: [res.data.receiverEmail],
        });
        if (users.totalCount > 0) {
          const user = users.data[0];
          const publicChannels =
            await this.conversationsService.getAllPublicChannelByWorkspaceId(
              res.data.workspaceId,
            );
          if (Array.isArray(publicChannels.data)) {
            const promises = publicChannels.data.map((channel) => {
              return this.conversationsService.addMemberToChannel(
                channel._id,
                user.id,
              );
            });
            await Promise.allSettled(promises);
          }
          const createSystemMessageDto: CreateSystemMessageDto = {
            content: 'member.joined',
            channelId: res.data.channelId,
            senderId: user.id,
            type: MessageType.SYSTEM,
            sender: {
              clerkUserId: user.id,
              fullName: user.fullName,
              imageUrl: user.imageUrl,
            },
          };

          this.clientMessage.emit(
            'create-system-message',
            createSystemMessageDto,
          );

          await this.pusherService.trigger(
            res.data.channelId,
            'new-member-joined',
            res,
          );
        }
      }
      return res;
    } catch (e) {
      console.log(e);
      return new InternalServerErrorDto();
    }
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
    const { channelId, isFolder, payload, type } = data;
    try {
      const res = await this.conversationsService.createBookmark(
        channelId,
        isFolder,
        payload,
        type,
      );

      this.pusherService.trigger(channelId, 'add-bookmark', res || {});
      return res;
    } catch (e) {
      return e;
    }
  }

  @MessagePattern({ cmd: 'update-bookmark' })
  async handleUpdateBookmark(data: any) {
    const { channelId, isFolder, payload, type } = data;
    try {
      const res = await this.conversationsService.updateBookmark(
        channelId,
        isFolder,
        payload,
        type,
      );
      if (res) {
        this.pusherService.trigger(channelId, 'add-bookmark', res);
      }
      return res;
    } catch (e) {
      return e;
    }
  }

  @MessagePattern({ cmd: 'delete-bookmark' })
  async handleDeleteBookmark(data: any) {
    const { channelId, bookmarkData } = data;

    try {
      const res = await this.conversationsService.deleteBookmark(
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
        await this.conversationsService.removeUserFromChannel(deleteUserDto);
      this.pusherService.trigger(deleteUserDto.channelId, 'remove-user', res);
      this.pusherService.trigger(deleteUserDto.deleteId, 'remove-user', res);
      return res;
    } catch (e) {
      return new InternalServerErrorDto();
    }
  }

  @EventPattern('create-direct-conversation')
  async createDirectConversation(data: CreateDirectConversationDto) {
    try {
      return this.conversationsService.createDirectConversation(data);
    } catch (e) {
      return new InternalServerErrorDto();
    }
  }

  @MessagePattern({ cmd: 'get-direct-conversation' })
  async getDirectConversation(data: GetDirectConversationDto) {
    try {
      const res = await this.conversationsService.getDirectConversation(data);
      if (res.status === ApiStatus.OK) {
        const promises = res.data.map(async (item) => {
          const getUserDto: GetUserDto = {
            field: item.members,
            findBy: FindBy.CLERK_USER_ID,
          };

          const users: GetUserResponseDto = await lastValueFrom(
            this.clientAuth.send({ cmd: 'get-all-users' }, getUserDto),
          );

          if (users.status === ApiStatus.OK) {
            item.membersInfo = users.data;
          }
          return item;
        });
        await Promise.allSettled(promises);
      }
      return res;
    } catch (e) {
      return new InternalServerErrorDto();
    }
  }

  @MessagePattern({ cmd: 'get-direct-conversation-by-id' })
  async getDCById(id: string) {
    try {
      const res = await this.conversationsService.getDCById(id);
      if (res.status === ApiStatus.OK) {
        const getUserDto: GetUserDto = {
          field: res.data[0].members,
          findBy: FindBy.CLERK_USER_ID,
        };
        const users: GetUserResponseDto = await lastValueFrom(
          this.clientAuth.send({ cmd: 'get-all-users' }, getUserDto),
        );
        if (users.status === ApiStatus.OK) {
          res.data[0].membersInfo = users.data;
        }
      }
      return res;
    } catch (e) {
      return new InternalServerErrorDto();
    }
  }

  @MessagePattern({ cmd: 'get-channel-task' })
  async getChannelTask(channelId: string) {
    try {
      return await this.conversationsService.getChannelTaskByChannelId(
        channelId,
      );
    } catch (e) {
      return new InternalServerErrorDto();
    }
  }

  @MessagePattern({ cmd: 'create-task' })
  async createTask(data: CreateTaskDto) {
    try {
      console.log(data);

      return await this.conversationsService.createChannelTask(data);
    } catch (e) {
      console.log(e);

      return new InternalServerErrorDto();
    }
  }

  @MessagePattern({ cmd: 'update-task' })
  async updateTask(data: UpdateTaskDto) {
    try {
      return await this.conversationsService.updateChannelTask(data);
    } catch (e) {
      return new InternalServerErrorDto();
    }
  }

  @MessagePattern({ cmd: 'update-task-state' })
  async updateStateTask(data: UpdateStateTaskDto) {
    try {
      return await this.conversationsService.updateTaskState(data);
    } catch (e) {
      return new InternalServerErrorDto();
    }
  }

  @MessagePattern({ cmd: 'create-task-column' })
  async createTaskColumn(data: CreateTaskColumnDto) {
    try {
      return await this.conversationsService.createChannelTaskColumn(data);
    } catch (e) {
      return new InternalServerErrorDto();
    }
  }

  @MessagePattern({ cmd: 'update-task-column' })
  async updateTaskColumn(data: UpdateTaskColumnDto) {
    try {
      return await this.conversationsService.updateTaskColumn(data);
    } catch (e) {
      return new InternalServerErrorDto();
    }
  }
}
