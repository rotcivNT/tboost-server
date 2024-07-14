import { AbstractRepository } from '@app/common/database/abstract.repository';
import { MessageItem } from './schema/message.schema';
import { Model } from 'mongoose';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LIMIT_MESSAGE } from '../constants';

export class MessageItemRepository extends AbstractRepository<MessageItem> {
  protected readonly logger = new Logger(MessageItemRepository.name);
  constructor(
    @InjectModel(MessageItem.name)
    private readonly messageItemModel: Model<MessageItem>,
  ) {
    super(messageItemModel);
  }

  async deleteFile(_id: string, fileUrl: string) {
    const updatedDoc = await this.messageItemModel.findOneAndUpdate(
      { _id },
      {
        $pull: { files: { url: fileUrl } },
      },

      {
        new: true,
      },
    );
    if (updatedDoc.files.length === 0) {
      updatedDoc.isDelete = true;
      await updatedDoc.save();
    }
    return updatedDoc;
  }

  // match query createdAt < .... and _id
  // around
  // before id ?
  // check discord api
  async getListMessages(
    receiverId: string,
    beforeId: string,
    afterId: string,
    aroundId: string,
  ) {
    let messagesList = [];

    const message = await this.messageItemModel.findOne({
      receiverId,
      _id: beforeId || afterId || aroundId,
    });
    if (message) {
      if (beforeId) {
        messagesList = await this.messageItemModel
          .aggregate()
          .match({
            receiverId,
            createdAt: { $lt: message.createdAt },
          })
          .sort({ createdAt: -1 })
          .limit(LIMIT_MESSAGE)
          .lookup({
            from: 'message-item',
            localField: 'replyFor',
            foreignField: '_id',
            as: 'replyFor',
          })
          .group({
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            messages: { $push: '$$ROOT' },
          });
      } else if (afterId) {
        messagesList = await this.messageItemModel
          .aggregate()
          .match({
            receiverId,
            createdAt: { $gt: message.createdAt },
          })
          .sort({ createdAt: 1 })
          .limit(LIMIT_MESSAGE)
          .lookup({
            from: 'message-item',
            localField: 'replyFor',
            foreignField: '_id',
            as: 'replyMessage',
          })
          .group({
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            messages: { $push: '$$ROOT' },
          });
      } else if (aroundId) {
        messagesList = await this.messageItemModel
          .aggregate()
          .match({
            receiverId,
            createdAt: { $lte: message.createdAt },
          })
          .sort({ createdAt: -1 })
          .limit(LIMIT_MESSAGE / 2)
          .lookup({
            from: 'message-item',
            localField: 'replyFor',
            foreignField: '_id',
            as: 'replyMessage',
          })
          .group({
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            messages: { $push: '$$ROOT' },
          });
        const afterMessages = await this.messageItemModel
          .aggregate()
          .match({
            receiverId,
            createdAt: { $gt: message.createdAt },
          })
          .sort({ createdAt: 1 })
          .limit(LIMIT_MESSAGE / 2)
          .lookup({
            from: 'message-item',
            localField: 'replyFor',
            foreignField: '_id',
            as: 'replyMessage',
          })
          .group({
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            messages: { $push: '$$ROOT' },
          });
        if (
          messagesList[messagesList.length - 1]._id === afterMessages[0]._id
        ) {
          messagesList[messagesList.length - 1].messages.push(
            ...afterMessages.shift().messages,
          );
        }
        messagesList = [...messagesList, ...afterMessages];
      }
    } else {
      messagesList = await this.messageItemModel
        .aggregate()
        .match({
          receiverId,
        })
        .sort({ createdAt: -1 })
        .limit(LIMIT_MESSAGE)
        .lookup({
          from: 'message-item',
          localField: 'replyFor',
          foreignField: '_id',
          as: 'replyMessage',
        })
        .group({
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          messages: { $push: '$$ROOT' },
        });
    }
    messagesList.sort((a, b) => {
      return new Date(a._id).getTime() - new Date(b._id).getTime();
    });
    messagesList.forEach((item) => {
      item.messages = item.messages.sort((a, b) => {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
    });
    return messagesList;
  }
}
