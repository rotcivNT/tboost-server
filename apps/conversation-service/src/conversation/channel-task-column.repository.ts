import { AbstractRepository } from '@app/common/database/abstract.repository';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ChannelTaskColumn } from './schema/channel-task-column';

@Injectable()
export class ChannelTaskColumnRepository extends AbstractRepository<ChannelTaskColumn> {
  protected readonly logger = new Logger(ChannelTaskColumnRepository.name);

  constructor(
    @InjectModel(ChannelTaskColumn.name)
    protected readonly channelTaskColumnModel: Model<ChannelTaskColumn>,
  ) {
    super(channelTaskColumnModel);
  }
  async findById(channelId: string) {
    const tasks = await this.channelTaskColumnModel
      .aggregate()
      .match({
        channelId,
      })
      .lookup({
        from: 'channel-tasks',
        localField: 'taskOrderIds',
        foreignField: '_id',
        as: 'taskOrders',
      })
      .addFields({
        taskOrders: {
          $map: {
            input: '$taskOrderIds',
            as: 'taskId',
            in: {
              $arrayElemAt: [
                '$taskOrders',
                { $indexOfArray: ['$taskOrders._id', '$$taskId'] },
              ],
            },
          },
        },
      });

    return tasks;
  }
  async updateTaskOrder(id: string, taskId: mongoose.Schema.Types.ObjectId) {
    const res = await this.channelTaskColumnModel.findById(id).updateOne({
      $push: {
        taskOrderIds: taskId,
      },
    });
    return res;
  }
}
