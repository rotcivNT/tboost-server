import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateMessageDto } from './dto/create-messate.dto';
import { DeleteFileMessageDto } from './dto/delete-file-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessageItemRepository } from './message-item.repository';

@Injectable()
export class MessagesService {
  constructor(
    @Inject('CHANNEL_SERVICE') private channelClient: ClientProxy,
    @Inject('UPLOAD_SERVICE') private uploadClient: ClientProxy,
    private readonly messageItemRepository: MessageItemRepository,
  ) {}

  async createMessage(createMessageDto: CreateMessageDto) {
    try {
      createMessageDto.createdAt = new Date();
      createMessageDto.updatedAt = new Date();

      const message = await this.messageItemRepository.create(createMessageDto);
      this.channelClient.emit('message-delivery', {
        channelId: createMessageDto.receiverId,
        message,
        socketId: createMessageDto.socketId,
      });

      return message;
    } catch (e) {
      return e;
    }
  }

  async getListMessage(channelId: string, page: number, pageSize: number) {
    return this.messageItemRepository.getListMessages(
      channelId,
      page,
      pageSize,
    );
  }

  async updateMessage(updateMessageDto: UpdateMessageDto) {
    updateMessageDto.updatedAt = new Date();
    const updatedDoc = await this.messageItemRepository.findOneAndUpdate(
      { _id: updateMessageDto._id },
      updateMessageDto,
    );
    this.channelClient.emit('message-delivery', {
      channelId: updateMessageDto.channelId,
      message: updatedDoc,
      socketId: updateMessageDto.socketId,
      type: 'update',
    });
    return updatedDoc;
  }

  async forwardMessage(createMessageDto: CreateMessageDto) {
    try {
      createMessageDto.createdAt = new Date();
      createMessageDto.updatedAt = new Date();
      const message = await this.messageItemRepository.create(createMessageDto);
      this.channelClient.emit('message-delivery', {
        channelId: message.receiverId,
        message,
        socketId: createMessageDto.socketId,
      });

      return message;
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
}
