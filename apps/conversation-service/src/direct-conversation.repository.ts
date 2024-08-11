import { AbstractRepository } from '@app/common/database/abstract.repository';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DirectConversation } from './schema/direct-conversation.schema';

@Injectable()
export class DirectConversationRepository extends AbstractRepository<DirectConversation> {
  protected readonly logger = new Logger(DirectConversationRepository.name);
  constructor(
    @InjectModel(DirectConversation.name)
    protected readonly directConversationModel: Model<DirectConversation>,
  ) {
    super(directConversationModel);
  }

  findOneReturnDocument(_id: string) {
    return this.directConversationModel.findOne({
      _id,
    });
  }
}
