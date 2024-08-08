import { clerkClient } from '@clerk/clerk-sdk-node';
import { MailerService } from '@nestjs-modules/mailer';
import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateBookmarkDto,
  CreateBookmarkFolderDto,
} from 'apps/api-gateway/src/dtos/conversation-dto/channel-dto/create-bookmark.dto';
import { CreateChannelDto } from 'apps/api-gateway/src/dtos/conversation-dto/channel-dto/create-channel.dto';
import { CreateInvitationDto } from 'apps/api-gateway/src/dtos/conversation-dto/channel-dto/create-invitation.dto';
import { DeleteBookmarkDto } from 'apps/api-gateway/src/dtos/conversation-dto/channel-dto/delete-bookmark.dto';
import { RemoveUserDto } from 'apps/api-gateway/src/dtos/conversation-dto/channel-dto/remove-user.dto';
import {
  UpdateBookmarkDto,
  UpdateBookmarkFolderDto,
} from 'apps/api-gateway/src/dtos/conversation-dto/channel-dto/update-bookmark.dto';
import { UpdateChannelDto } from 'apps/api-gateway/src/dtos/conversation-dto/channel-dto/update-channel.dto';
import { CreateDirectConversationDto } from 'apps/api-gateway/src/dtos/conversation-dto/direct-conversation-dto/create-direct-conversation';
import { GetDirectConversationDto } from 'apps/api-gateway/src/dtos/conversation-dto/direct-conversation-dto/get-direct-conversation';
import { ApiStatus } from 'apps/api-gateway/src/types/api-status';
import { AcceptInvitationResponseDto } from 'apps/conversation-service/src/conversation/dto/response-dto/accept-invitation-response.dto';
import { CreateChannelResponseDto } from 'apps/conversation-service/src/conversation/dto/response-dto/create-channel-response.dto';
import { DeleteBookmarkReponseDto } from 'apps/conversation-service/src/conversation/dto/response-dto/delete-bookmark-reponse.dto';
import { DeleteChannelResponseDto } from 'apps/conversation-service/src/conversation/dto/response-dto/delete-channel-response.dto';
import { GetChannelResponseDto } from 'apps/conversation-service/src/conversation/dto/response-dto/get-channel-response.dto';
import { SendInvitationReponseDto } from 'apps/conversation-service/src/conversation/dto/response-dto/send-invitation-reponse.dto';
import { UpdateChannelResponseDto } from 'apps/conversation-service/src/conversation/dto/response-dto/update-channel-response.dto';
import { ObjectId } from 'mongoose';
import { ChannelInvitationRepository } from './channel-invitation.repository';
import { ChannelRepository } from './channel.repository';
import { DirectConversationRepository } from './direct-conversation.repository';
import {
  DCResponseData,
  GetDirectConversationResponseDto,
} from './dto/response-dto/get-direct-conversation-response.dto';
import { ConversationType } from './types/conversation.type';
import { handleCreateBookmark } from './helper/handleCreateBookmark';
import { CreateBookmarkResponseDto } from './dto/response-dto/create-bookmark-response.dto';
import { handleUpdateBookmark } from './helper/handleUpdateBookmark';
import { UpdateBookmarkReponseDto } from './dto/response-dto/update-bookmark-response.dto';
import { handleDeleteBookmark } from './helper/handleDeleteBookmark';
import { ChannelTaskRepository } from './channel-task.repository';
import { GetChannelTaskResponse } from './dto/response-dto/get-channel-task.response.dto';
import { CreateTaskDto } from 'apps/api-gateway/src/dtos/conversation-dto/task-dto/create-task.dto';
import {
  UpdateStateTaskDto,
  UpdateTaskDto,
} from 'apps/api-gateway/src/dtos/conversation-dto/task-dto/update-task.dto';
import { ChannelTaskColumnRepository } from './channel-task-column.repository';
import { CreateTaskColumnDto } from 'apps/api-gateway/src/dtos/conversation-dto/task-dto/create-task-column.dto';
import { UpdateTaskColumnDto } from 'apps/api-gateway/src/dtos/conversation-dto/task-dto/update-task-column.dto';

@Injectable()
export class ConversationsService {
  constructor(
    private readonly channelRepository: ChannelRepository,
    private readonly channelInvitationRepository: ChannelInvitationRepository,
    private readonly directConversationRepository: DirectConversationRepository,
    private readonly mailService: MailerService,
    private readonly channelTaskRepository: ChannelTaskRepository,
    private readonly channelTaskColumnRepository: ChannelTaskColumnRepository,
  ) {}

  async createChannel(
    createChannelDto: CreateChannelDto,
  ): Promise<CreateChannelResponseDto> {
    const createdChannel =
      await this.channelRepository.create(createChannelDto);
    if (!createdChannel) {
      return {
        data: null,
        message: 'Channel not created',
        status: ApiStatus.ERROR,
        statusCode: HttpStatus.CREATED,
      };
    }
    return {
      data: createdChannel,
      message: 'Channel created successfully',
      status: ApiStatus.OK,
      statusCode: HttpStatus.CREATED,
    };
  }

  async findAll(
    workspaceID?: string,
    userID?: string,
  ): Promise<GetChannelResponseDto> {
    try {
      const res = await this.channelRepository.find({
        workspaceID,
        members: {
          $elemMatch: { userID: userID },
        },
      });
      return {
        data: res,
        message: 'Success',
        status: ApiStatus.OK,
        statusCode: HttpStatus.OK,
      };
    } catch (e) {
      if (e instanceof NotFoundException) {
        return {
          data: null,
          message: 'Not Found',
          status: ApiStatus.ERROR,
          statusCode: HttpStatus.NOT_FOUND,
        };
      }
    }
  }

  async findOne(_id: string): Promise<GetChannelResponseDto> {
    try {
      const channel = await this.channelRepository.findOne({ _id });
      return {
        data: channel,
        message: 'Success',
        status: ApiStatus.OK,
        statusCode: HttpStatus.OK,
      };
    } catch (e) {
      if (e instanceof NotFoundException) {
        return {
          data: null,
          message: 'Not Found',
          status: ApiStatus.ERROR,
          statusCode: HttpStatus.NOT_FOUND,
        };
      }
    }
  }

  async update(
    _id: string,
    updateChannelDto: UpdateChannelDto,
  ): Promise<UpdateChannelResponseDto> {
    const res = await this.channelRepository.findOneAndUpdate(
      { _id },
      updateChannelDto,
    );
    if (!res) {
      return {
        data: null,
        message: 'Channel not updated',
        status: ApiStatus.ERROR,
        statusCode: HttpStatus.BAD_REQUEST,
      };
    }
    return {
      data: res,
      message: 'Channel updated successfully',
      status: ApiStatus.OK,
      statusCode: HttpStatus.OK,
    };
  }

  async remove(_id: string): Promise<DeleteChannelResponseDto> {
    const deletedChannel = await this.channelRepository.findOneAndDelete({
      _id,
    });
    if (!deletedChannel) {
      return {
        data: null,
        message: 'Channel not deleted',
        status: ApiStatus.ERROR,
        statusCode: HttpStatus.BAD_REQUEST,
      };
    }
    return {
      data: null,
      message: 'Channel deleted successfully',
      status: ApiStatus.OK,
      statusCode: HttpStatus.OK,
    };
  }

  async createBookmark(
    conversationId: string,
    isFolder: boolean,
    payload: CreateBookmarkDto | CreateBookmarkFolderDto,
    type: ConversationType,
  ): Promise<CreateBookmarkResponseDto> {
    if (type === ConversationType.DIRECT_MESSAGE) {
      const conversation =
        await this.directConversationRepository.findOneReturnDocument(
          conversationId,
        );

      const res = await handleCreateBookmark(conversation, isFolder, payload);
      if (res.status === ApiStatus.OK) {
        conversation.bookmarkFolders = res.data.bookmarkFolders;
        conversation.bookmarks = res.data.bookmarks;
        await conversation.save();
      }
      return res;
    }
    if (type === ConversationType.CHANNEL) {
      const conversation =
        await this.channelRepository.findOneReturnDocument(conversationId);
      const res = await handleCreateBookmark(conversation, isFolder, payload);
      if (res.status === ApiStatus.OK) {
        conversation.bookmarkFolders = res.data.bookmarkFolders;
        conversation.bookmarks = res.data.bookmarks;
        await conversation.save();
      }
      return res;
    }
  }

  async updateBookmark(
    conversationId: string,
    isFolder: boolean,
    payload: UpdateBookmarkDto | UpdateBookmarkFolderDto,
    type: ConversationType,
  ): Promise<UpdateBookmarkReponseDto> {
    if (type === ConversationType.DIRECT_MESSAGE) {
      const conversation =
        await this.directConversationRepository.findOneReturnDocument(
          conversationId,
        );

      const res = await handleUpdateBookmark(conversation, isFolder, payload);
      if (res.status === ApiStatus.OK) {
        conversation.bookmarkFolders = res.data.bookmarkFolders;
        conversation.bookmarks = res.data.bookmarks;
        await conversation.save();
      }
      return res;
    }
    if (type === ConversationType.CHANNEL) {
      const conversation =
        await this.channelRepository.findOneReturnDocument(conversationId);
      const res = await handleUpdateBookmark(conversation, isFolder, payload);
      if (res.status === ApiStatus.OK) {
        conversation.bookmarkFolders = res.data.bookmarkFolders;
        conversation.bookmarks = res.data.bookmarks;
        await conversation.save();
      }
      return res;
    }
  }

  async deleteBookmark(
    conversationId: string,
    payload: DeleteBookmarkDto,
  ): Promise<DeleteBookmarkReponseDto> {
    if (payload.type === ConversationType.DIRECT_MESSAGE) {
      const conversation =
        await this.directConversationRepository.findOneReturnDocument(
          conversationId,
        );

      const res = await handleDeleteBookmark(conversation, payload);
      if (res.status === ApiStatus.OK) {
        conversation.bookmarkFolders = res.data.bookmarkFolders;
        conversation.bookmarks = res.data.bookmarks;
        await conversation.save();
      }
      return res;
    }
    if (payload.type === ConversationType.CHANNEL) {
      const conversation =
        await this.channelRepository.findOneReturnDocument(conversationId);
      const res = await handleDeleteBookmark(conversation, payload);
      if (res.status === ApiStatus.OK) {
        conversation.bookmarkFolders = res.data.bookmarkFolders;
        conversation.bookmarks = res.data.bookmarks;
        await conversation.save();
      }
      return res;
    }
  }

  async sendInvitationToChannel(
    payload: CreateInvitationDto,
  ): Promise<SendInvitationReponseDto> {
    try {
      const res =
        await this.channelInvitationRepository.sendInvitationToChannel(payload);
      const redirectUrl = `${process.env.FRONT_END_HOST}/channel-invitation/${res.data._id}`;
      const memberShips =
        await clerkClient.organizations.getOrganizationMembershipList({
          organizationId: payload.workspaceId,
        });
      const user = await clerkClient.users.getUserList({
        emailAddress: [payload.receiverEmail],
      });

      const alreadyMember =
        user.totalCount > 0
          ? memberShips.data.find(
              (member) => member.publicUserData.userId === user.data[0].id,
            )
          : false;

      if (alreadyMember) {
        const message = `
        <a href="${redirectUrl}">
        Accept (expired in 7 days)
        </a>
    `;
        this.mailService.sendMail({
          from: payload.senderEmail,
          to: payload.receiverEmail,
          subject: 'Invite to channel !',
          html: message,
        });
      } else {
        await clerkClient.organizations.createOrganizationInvitation({
          emailAddress: payload.receiverEmail,
          redirectUrl,
          inviterUserId: payload.senderId,
          organizationId: payload.workspaceId,
          role: payload.role,
        });
      }

      return res;
    } catch (e) {
      console.log(e);
    }
  }

  acceptInvitation(_id: string): Promise<AcceptInvitationResponseDto> {
    return this.channelInvitationRepository.handleAcceptInvitation(_id);
  }

  async addMemberToChannel(
    channelId: string | ObjectId,
    clerkUserId: string,
  ): Promise<UpdateChannelResponseDto> {
    return this.channelRepository.addMemberToChannel(channelId, clerkUserId);
  }

  async removeUserFromChannel(deleteUserDto: RemoveUserDto) {
    return this.channelRepository.removeMemberFromChannel(deleteUserDto);
  }

  async getAllPublicChannelByWorkspaceId(
    workspaceID: string,
  ): Promise<GetChannelResponseDto> {
    const channels = await this.channelRepository.find({
      workspaceID,
    });
    if (channels.length === 0) {
      return {
        data: null,
        message: 'Channel not found',
        status: ApiStatus.ERROR,
        statusCode: HttpStatus.NOT_FOUND,
      };
    }
    return {
      data: channels,
      message: 'Success',
      status: ApiStatus.OK,
      statusCode: HttpStatus.OK,
    };
  }

  async createDirectConversation(data: CreateDirectConversationDto) {
    const { members, type, workspaceId } = data;
    const allMembersInWorkspace =
      await clerkClient.organizations.getOrganizationMembershipList({
        organizationId: workspaceId,
      });

    const promises = allMembersInWorkspace.data.map((member) => {
      if (member.publicUserData.userId === members[0]) return undefined;
      const payload = {
        members: [...members, member.id],
        type,
        workspaceId,
      };
      return this.directConversationRepository.create(payload);
    });
    const res = await Promise.allSettled(promises);
    console.log(res);

    return;
  }

  async getDirectConversation(
    getDirectConversationDto: GetDirectConversationDto,
  ): Promise<GetDirectConversationResponseDto> {
    const { workspaceId, memberClerkUserId } = getDirectConversationDto;

    const dConversation = await this.directConversationRepository.find({
      workspaceId,
      members: {
        $all: [memberClerkUserId],
      },
    });
    if (dConversation.length === 0) {
      return {
        data: null,
        message: 'Direct conversation not found',
        status: ApiStatus.ERROR,
        statusCode: HttpStatus.NOT_FOUND,
      };
    }

    const dcResponse: DCResponseData[] = dConversation.map((item) => {
      return {
        ...item,
        membersInfo: [],
      };
    });

    return {
      data: dcResponse,
      message: 'Success',
      status: ApiStatus.OK,
      statusCode: HttpStatus.OK,
    };
  }

  async getDCById(id: string): Promise<GetDirectConversationResponseDto> {
    const dc = await this.directConversationRepository.findOne({
      _id: id,
    });
    if (!dc) {
      return {
        data: null,
        message: 'Direct conversation not found',
        status: ApiStatus.ERROR,
        statusCode: HttpStatus.NOT_FOUND,
      };
    }
    return {
      data: [
        {
          ...dc,
          membersInfo: [],
        },
      ],
      message: 'Success',
      status: ApiStatus.OK,
      statusCode: HttpStatus.OK,
    };
  }

  async createChannelTaskColumn(createTaskColumnDto: CreateTaskColumnDto) {
    const insertData = {
      ...createTaskColumnDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const res = await this.channelTaskColumnRepository.create(insertData);
    if (!res) {
      return {
        data: null,
        message: 'Task column not created',
        status: ApiStatus.ERROR,
        statusCode: HttpStatus.BAD_REQUEST,
      };
    }
    return {
      data: [res],
      message: 'Task column created successfully',
      status: ApiStatus.OK,
      statusCode: HttpStatus.CREATED,
    };
  }

  async getChannelTaskByChannelId(
    channelId: string,
  ): Promise<GetChannelTaskResponse> {
    const tasks = await this.channelTaskColumnRepository.findById(channelId);
    if (tasks.length === 0) {
      return {
        data: null,
        message: 'Tasks not found',
        status: ApiStatus.ERROR,
        statusCode: HttpStatus.NOT_FOUND,
      };
    }
    return {
      data: tasks,
      message: 'Success',
      status: ApiStatus.OK,
      statusCode: HttpStatus.OK,
    };
  }

  async createChannelTask(
    createChannelTaskDto: CreateTaskDto,
  ): Promise<GetChannelTaskResponse> {
    const insertData = {
      ...createChannelTaskDto,
      updatedAt: new Date(),
      createdAt: new Date(),
    };
    const res = await this.channelTaskRepository.create(insertData);
    if (!res) {
      return {
        data: null,
        message: 'Task not created',
        status: ApiStatus.ERROR,
        statusCode: HttpStatus.CREATED,
      };
    }
    await this.channelTaskColumnRepository.updateTaskOrder(
      createChannelTaskDto.columnId,
      res._id,
    );
    return {
      data: [res],
      message: 'Task created successfully',
      status: ApiStatus.OK,
      statusCode: HttpStatus.CREATED,
    };
  }

  async updateChannelTask(
    updateChannelTaskDto: UpdateTaskDto,
  ): Promise<GetChannelTaskResponse> {
    const res = await this.channelTaskRepository.findOneAndUpdate(
      {
        _id: updateChannelTaskDto.taskId,
      },
      updateChannelTaskDto,
    );
    if (!res) {
      return {
        data: null,
        message: 'Task not updated',
        status: ApiStatus.ERROR,
        statusCode: HttpStatus.BAD_REQUEST,
      };
    }
    return {
      data: [res],
      message: 'Task updated successfully',
      status: ApiStatus.OK,
      statusCode: HttpStatus.OK,
    };
  }

  async updateTaskState(
    updateStateTaskDto: UpdateStateTaskDto,
  ): Promise<GetChannelTaskResponse> {
    const { taskId, currentOrder, newOrder, newStatus, channelId } =
      updateStateTaskDto;

    try {
      await this.channelTaskRepository.findOneAndUpdate(
        {
          channelId,
          order: newOrder,
          status: newStatus,
        },
        {
          order: currentOrder,
        },
      );
    } catch (e) {}
    const updatedTask = await this.channelTaskRepository.findOneAndUpdate(
      {
        _id: taskId,
      },
      {
        status: newStatus,
        order: newOrder,
      },
    );
    if (updatedTask) {
      return {
        data: [updatedTask],
        message: 'Task updated successfully',
        status: ApiStatus.OK,
        statusCode: HttpStatus.OK,
      };
    }
    return {
      data: null,
      message: 'Task not updated',
      status: ApiStatus.ERROR,
      statusCode: HttpStatus.BAD_REQUEST,
    };
  }

  async updateTaskColumn(updateTaskColumnDto: UpdateTaskColumnDto) {
    const res = await this.channelTaskColumnRepository.findOneAndUpdate(
      {
        _id: updateTaskColumnDto.taskColumnId,
      },
      updateTaskColumnDto,
    );
    if (!res) {
      return {
        data: null,
        message: 'Task column not updated',
        status: ApiStatus.ERROR,
        statusCode: HttpStatus.BAD_REQUEST,
      };
    }
    return {
      data: [res],
      message: 'Task column updated successfully',
      status: ApiStatus.OK,
      statusCode: HttpStatus.OK,
    };
  }
}
