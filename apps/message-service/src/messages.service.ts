import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MessageType } from 'apps/api-gateway/src/constants';
import {
  AUTH_SERVICE,
  CONVERSATION_SERVICE,
  UPLOAD_SERVICE,
} from 'apps/api-gateway/src/constants/services';
import {
  FindBy,
  GetUserDto,
} from 'apps/api-gateway/src/dtos/auth-dto/get-user.dto';
import { CreateMeetingMessageDto } from 'apps/api-gateway/src/dtos/message-dto/create-meeting-message.dto';
import { CreateMessageDto } from 'apps/api-gateway/src/dtos/message-dto/create-message.dto';
import { CreateSystemMessageDto } from 'apps/api-gateway/src/dtos/message-dto/CreateSystemMessageDto';
import { DeleteFileMessageDto } from 'apps/api-gateway/src/dtos/message-dto/delete-file-message.dto';
import { UpdateMeetingStatusDto } from 'apps/api-gateway/src/dtos/message-dto/update-meeting-status.dto';
import { UpdateMessageDto } from 'apps/api-gateway/src/dtos/message-dto/update-message.dto';
import { ApiStatus } from 'apps/api-gateway/src/types/api-status';
import { GetUserResponseDto } from 'apps/auth-service/src/dto/response-dto/get-user-response.dto';
import { User } from 'apps/auth-service/src/schema/user.schema';
import { lastValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { CreateMessageResponseDto } from './dto/reponse-dto/create-message-response.dto';
import { GetMessageReponseDto } from './dto/reponse-dto/get-message-response.dto';
import { UpdateMessageReponseDto } from './dto/reponse-dto/update-message-response.dto';
import { MessageResponse } from './types';
import { MessageItemRepository } from './message-item.repository';
import { MessageItem } from './schema/message.schema';

@Injectable()
export class MessagesService {
  constructor(
    @Inject(CONVERSATION_SERVICE) private channelClient: ClientProxy,
    @Inject(UPLOAD_SERVICE) private uploadClient: ClientProxy,
    @Inject(AUTH_SERVICE) private authClient: ClientProxy,
    private readonly messageItemRepository: MessageItemRepository,
  ) {}

  async createMessage(
    createMessageDto: CreateMessageDto,
  ): Promise<CreateMessageResponseDto> {
    createMessageDto.createdAt = new Date();
    createMessageDto.updatedAt = new Date();

    const message = await this.messageItemRepository.create(createMessageDto);
    const deliveryMessage: MessageResponse = {
      ...message,
      sender: createMessageDto.sender,
    };

    this.channelClient.emit('message-delivery', {
      channelId: createMessageDto.receiverId,
      message: deliveryMessage,
      socketId: createMessageDto.socketId,
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Message created successfully',
      data: deliveryMessage,
      status: ApiStatus.OK,
    };
  }

  async getListMessage(
    receiverId: string,
    beforeId: string,
    afterId: string,
    aroundId: string,
  ): Promise<GetMessageReponseDto> {
    const clusters = await this.messageItemRepository.getListMessages(
      receiverId,
      beforeId,
      afterId,
      aroundId,
    );
    const senders = new Map<string, User>();
    const senderPromises: { [key: string]: Promise<GetUserResponseDto> } = {};

    for (const cluster of clusters) {
      for (const message of cluster.messages) {
        if (!senders.has(message.senderId)) {
          if (!senderPromises[message.senderId]) {
            const getUserDto: GetUserDto = {
              field: message.senderId,
              findBy: FindBy.CLERK_USER_ID,
            };
            senderPromises[message.senderId] = lastValueFrom(
              this.authClient.send({ cmd: 'get-user' }, getUserDto),
            );
          }
          const senderRes = await senderPromises[message.senderId];
          senders.set(message.senderId, senderRes.data[0]);
          message.sender = senderRes.data[0];
        } else {
          message.sender = senders.get(message.senderId);
        }

        if (message.replyMessage && message.replyMessage.length > 0) {
          const senderIdOfReplyMessage = message.replyMessage[0].senderId;
          if (!senders.has(senderIdOfReplyMessage)) {
            if (!senderPromises[senderIdOfReplyMessage]) {
              const getUserDto: GetUserDto = {
                field: senderIdOfReplyMessage,
                findBy: FindBy.CLERK_USER_ID,
              };
              senderPromises[senderIdOfReplyMessage] = lastValueFrom(
                this.authClient.send({ cmd: 'get-user' }, getUserDto),
              );
            }
            const senderOfReplyMessage =
              await senderPromises[senderIdOfReplyMessage];
            senders.set(senderIdOfReplyMessage, senderOfReplyMessage.data[0]);
            message.replyMessage[0].sender = senderOfReplyMessage.data[0];
          } else {
            message.replyMessage[0].sender = senders.get(
              senderIdOfReplyMessage,
            );
          }
        }
      }
    }
    return {
      data: clusters,
      message: 'Get list message successfully',
      status: ApiStatus.OK,
      statusCode: HttpStatus.OK,
    };
  }

  async updateMessage(
    updateMessageDto: UpdateMessageDto,
  ): Promise<UpdateMessageReponseDto> {
    updateMessageDto.updatedAt = new Date();
    const updatedDoc = await this.messageItemRepository.findOneAndUpdate(
      { _id: updateMessageDto._id },
      updateMessageDto,
    );
    const deliveryMessage: MessageResponse = {
      ...updatedDoc,
      sender: updateMessageDto.sender,
    };
    this.channelClient.emit('message-delivery', {
      channelId: updateMessageDto.channelId,
      message: deliveryMessage,
      socketId: updateMessageDto.socketId,
      type: 'update',
    });
    return {
      statusCode: HttpStatus.OK,
      message: 'Message updated successfully',
      data: deliveryMessage,
      status: ApiStatus.OK,
    };
  }

  async forwardMessage(
    createMessageDto: CreateMessageDto,
  ): Promise<UpdateMessageReponseDto> {
    try {
      createMessageDto.createdAt = new Date();
      createMessageDto.updatedAt = new Date();
      const message = await this.messageItemRepository.create(createMessageDto);
      const deliveryMessage: MessageResponse = {
        ...message,
        sender: createMessageDto.sender,
      };

      this.channelClient.emit('message-delivery', {
        channelId: message.receiverId,
        message: deliveryMessage,
        socketId: createMessageDto.socketId,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Message updated successfully',
        data: deliveryMessage,
        status: ApiStatus.OK,
      };
    } catch (e) {
      return e;
    }
  }

  async deleteFile(
    payload: DeleteFileMessageDto,
  ): Promise<UpdateMessageReponseDto> {
    const { _id, fileUrl } = payload;
    try {
      const updatedDocument = await this.messageItemRepository.deleteFile(
        _id,
        fileUrl,
      );
      this.channelClient.emit('message-delivery', {
        channelId: payload.channelId,
        message: updatedDocument,
        socketId: payload.socketId,
        type: 'update',
      });
      this.uploadClient.emit('delete-file', fileUrl);
      return {
        statusCode: HttpStatus.OK,
        message: 'Message updated successfully',
        data: {
          ...updatedDocument,
          sender: null,
        },
        status: ApiStatus.OK,
      };
    } catch (e) {
      return e;
    }
  }

  async createSystemMessage(createSystemMessageDto: CreateSystemMessageDto) {
    try {
      const messageProps: Partial<MessageItem> = {
        content: createSystemMessageDto.content,
        receiverId: createSystemMessageDto.channelId,
        senderId: createSystemMessageDto.senderId,
        files: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        uniqueId: uuidv4(),
        type: createSystemMessageDto.type,
      };

      const message = await this.messageItemRepository.create(messageProps);
      const deliveryMessage = {
        ...message,
        sender: createSystemMessageDto.sender,
      };
      this.channelClient.emit('message-delivery', {
        channelId: createSystemMessageDto.channelId,
        message: deliveryMessage,
      });
      return {
        code: 1,
        msg: 'Successfully',
      };
    } catch (e) {
      console.log(e);
      return e;
    }
  }

  async createMeetingMessage(createMeetingMessageDto: CreateMeetingMessageDto) {
    const messageProps: Partial<MessageItem> = {
      receiverId: createMeetingMessageDto.channelId,
      senderId: createMeetingMessageDto.senderId,
      content: createMeetingMessageDto.meetingLink,
      createdAt: new Date(),
      updatedAt: new Date(),
      uniqueId: uuidv4(),
      type: MessageType.MEETING,
      files: [],
    };

    try {
      const message = await this.messageItemRepository.create(messageProps);
      const deliveryMessage = {
        ...message,
        sender: createMeetingMessageDto.sender,
      };
      this.channelClient.emit('message-delivery', {
        channelId: createMeetingMessageDto.channelId,
        message: deliveryMessage,
      });
    } catch (e) {
      console.log(e);
    }
  }

  async updateMeetingStatus(payload: UpdateMeetingStatusDto) {
    const { meetingLink, isDelete } = payload;
    try {
      const message = await this.messageItemRepository.findOneAndUpdate(
        {
          content: meetingLink,
          type: MessageType.MEETING,
        },
        {
          isDelete: isDelete,
        },
      );
      const deliveryMessage = {
        ...message,
        sender: payload.sender,
      };
      this.channelClient.emit('message-delivery', {
        channelId: message.receiverId,
        message: deliveryMessage,
        type: 'update',
      });
    } catch (e) {
      console.log(e);
    }
  }
}
