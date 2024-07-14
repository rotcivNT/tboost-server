import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  AUTH_SERVICE,
  CHANNEL_SERVICE,
  UPLOAD_SERVICE,
} from 'apps/api-gateway/src/constants/services';
import { CreateMessageDto } from 'apps/api-gateway/src/dtos/message-dto/create-messate.dto';
import { lastValueFrom } from 'rxjs';
import { MessageItemRepository } from './message-item.repository';
import { User } from 'apps/auth-service/src/schema/user.schema';
import { MessageItem } from './schema/message.schema';
import { CreateSystemMessageDto } from 'apps/api-gateway/src/dtos/message-dto/CreateSystemMessageDto';
import { v4 as uuidv4 } from 'uuid';
import { UpdateMessageDto } from 'apps/api-gateway/src/dtos/message-dto/update-message.dto';
import { DeleteFileMessageDto } from 'apps/api-gateway/src/dtos/message-dto/delete-file-message.dto';
import { CreateMeetingMessageDto } from 'apps/api-gateway/src/dtos/message-dto/create-meeting-message.dto';
import { MessageType } from 'apps/api-gateway/src/constants';
import { UpdateMeetingStatusDto } from 'apps/api-gateway/src/dtos/message-dto/update-meeting-status.dto';

@Injectable()
export class MessagesService {
  constructor(
    @Inject(CHANNEL_SERVICE) private channelClient: ClientProxy,
    @Inject(UPLOAD_SERVICE) private uploadClient: ClientProxy,
    @Inject(AUTH_SERVICE) private authClient: ClientProxy,
    private readonly messageItemRepository: MessageItemRepository,
  ) {}

  async createMessage(createMessageDto: CreateMessageDto) {
    try {
      createMessageDto.createdAt = new Date();
      createMessageDto.updatedAt = new Date();

      const message = await this.messageItemRepository.create(createMessageDto);
      const deliveryMessage: any = {
        ...message,
        sender: createMessageDto.sender,
      };

      this.channelClient.emit('message-delivery', {
        channelId: createMessageDto.receiverId,
        message: deliveryMessage,
        socketId: createMessageDto.socketId,
      });

      return deliveryMessage;
    } catch (e) {
      console.log(e);
      return e;
    }
  }

  async getListMessage(
    receiverId: string,
    beforeId: string,
    afterId: string,
    aroundId: string,
  ) {
    const clusters = await this.messageItemRepository.getListMessages(
      receiverId,
      beforeId,
      afterId,
      aroundId,
    );
    const senders = new Map<string, User>();
    const senderPromises: { [key: string]: Promise<User> } = {};

    for (const cluster of clusters) {
      for (const message of cluster.messages) {
        if (!senders.has(message.senderId)) {
          if (!senderPromises[message.senderId]) {
            senderPromises[message.senderId] = lastValueFrom(
              this.authClient.send({ cmd: 'get-user' }, message.senderId),
            );
          }
          const sender = await senderPromises[message.senderId];
          senders.set(message.senderId, sender);
          message.sender = sender;
        } else {
          message.sender = senders.get(message.senderId);
        }

        if (message.replyMessage && message.replyMessage.length > 0) {
          const senderIdOfReplyMessage = message.replyMessage[0].senderId;
          if (!senders.has(senderIdOfReplyMessage)) {
            if (!senderPromises[senderIdOfReplyMessage]) {
              senderPromises[senderIdOfReplyMessage] = lastValueFrom(
                this.authClient.send(
                  { cmd: 'get-user' },
                  senderIdOfReplyMessage,
                ),
              );
            }
            const senderOfReplyMessage =
              await senderPromises[senderIdOfReplyMessage];
            senders.set(senderIdOfReplyMessage, senderOfReplyMessage);
            message.replyMessage[0].sender = senderOfReplyMessage;
          } else {
            message.replyMessage[0].sender = senders.get(
              senderIdOfReplyMessage,
            );
          }
        }
      }
    }

    return clusters;
  }

  async updateMessage(updateMessageDto: UpdateMessageDto) {
    updateMessageDto.updatedAt = new Date();
    const updatedDoc = await this.messageItemRepository.findOneAndUpdate(
      { _id: updateMessageDto._id },
      updateMessageDto,
    );
    const deliveryMessage = {
      ...updatedDoc,
      sender: updateMessageDto.sender,
    };
    this.channelClient.emit('message-delivery', {
      channelId: updateMessageDto.channelId,
      message: deliveryMessage,
      socketId: updateMessageDto.socketId,
      type: 'update',
    });
    return deliveryMessage;
  }

  async forwardMessage(createMessageDto: CreateMessageDto) {
    try {
      createMessageDto.createdAt = new Date();
      createMessageDto.updatedAt = new Date();
      const message = await this.messageItemRepository.create(createMessageDto);
      const deliveryMessage = {
        ...message,
        sender: createMessageDto.sender,
      };

      this.channelClient.emit('message-delivery', {
        channelId: message.receiverId,
        message: deliveryMessage,
        socketId: createMessageDto.socketId,
      });

      return deliveryMessage;
    } catch (e) {
      return e;
    }
  }

  async deleteFile(payload: DeleteFileMessageDto) {
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
      return updatedDocument;
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
        // sender: createSystemMessageDto.sender,
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
