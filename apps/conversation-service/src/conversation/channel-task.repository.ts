import { AbstractRepository } from '@app/common/database/abstract.repository';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChannelTask } from './schema/channel-task.schema';

@Injectable()
export class ChannelTaskRepository extends AbstractRepository<ChannelTask> {
  protected readonly logger = new Logger(ChannelTaskRepository.name);

  constructor(
    @InjectModel(ChannelTask.name)
    protected readonly channelTaskModel: Model<ChannelTask>,
  ) {
    super(channelTaskModel);
  }
}
