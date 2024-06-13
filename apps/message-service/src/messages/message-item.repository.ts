import { AbstractRepository } from '@app/common/database/abstract.repository';
import { MessageItem } from './schema/message.schema';
import { Model } from 'mongoose';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

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

  async getListMessages(
    receiverId: string,
    page: number = 1,
    pageSize: number = 20,
  ) {
    const query = {
      receiverId,
    };

    // return this.messageItemModel
    //   .find(query)
    //   .sort({ createdAt: -1 })
    //   .limit(pageSize)
    //   .skip(pageSize * (page - 1))
    //   .exec();
    const res = await this.messageItemModel
      .aggregate()
      .match(query)
      .sort({ createdAt: -1 })
      .skip(pageSize * (page - 1))
      .limit(pageSize)
      .group({
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        messages: { $push: '$$ROOT' },
      })
      .exec();
    res.sort((a, b) => {
      return new Date(a._id).getTime() - new Date(b._id).getTime();
    });
    res.forEach((item) => {
      item.messages = item.messages.sort((a, b) => {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
    });
    return res;
  }
}
