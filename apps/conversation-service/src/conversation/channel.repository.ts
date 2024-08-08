import { AbstractRepository } from '@app/common/database/abstract.repository';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RemoveUserDto } from 'apps/api-gateway/src/dtos/conversation-dto/channel-dto/remove-user.dto';
import { ApiStatus } from 'apps/api-gateway/src/types/api-status';
import { UpdateChannelResponseDto } from 'apps/conversation-service/src/conversation/dto/response-dto/update-channel-response.dto';
import { Model, ObjectId } from 'mongoose';
import { Channel } from './schema/channel.schema';
import { ConversationMember } from './types/conversation.type';

@Injectable()
export class ChannelRepository extends AbstractRepository<Channel> {
  protected readonly logger = new Logger(ChannelRepository.name);

  constructor(
    @InjectModel(Channel.name)
    protected readonly channelModel: Model<Channel>,
  ) {
    super(channelModel);
  }

  findOneReturnDocument(_id: string) {
    return this.channelModel.findOne({ _id });
  }

  async addMemberToChannel(
    _id: string | ObjectId,
    memberID: string,
  ): Promise<UpdateChannelResponseDto> {
    const channel = await this.channelModel.findOne({ _id });
    const data: ConversationMember = {
      userID: memberID,
      joinedAt: new Date(),
    };
    channel.members = [...channel.members, data];

    const savedDocument = await channel.save();
    return {
      data: savedDocument.toJSON() as unknown as Channel,
      message: 'Success',
      statusCode: HttpStatus.OK,
      status: ApiStatus.OK,
    };
  }

  async removeMemberFromChannel(
    deleteUserDto: RemoveUserDto,
  ): Promise<UpdateChannelResponseDto> {
    const { channelId, deleteId, senderId } = deleteUserDto;
    const channel = await this.channelModel.findOne({ _id: channelId });
    if (channel.creatorID !== senderId) {
      return {
        data: null,
        message: 'You are not authorized to remove a member',
        statusCode: HttpStatus.UNAUTHORIZED,
        status: ApiStatus.ERROR,
      };
    }
    const members = channel.members.filter(
      (member) => member.userID !== deleteId,
    );
    channel.members = members;
    const savedDocument = await channel.save();
    return {
      data: savedDocument.toJSON() as unknown as Channel,
      message: 'Success',
      statusCode: HttpStatus.OK,
      status: ApiStatus.OK,
    };
  }
}
