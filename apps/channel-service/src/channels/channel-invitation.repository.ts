import { AbstractRepository } from '@app/common/database/abstract.repository';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChannelRepository } from './channel.repository';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { ChannelInvitation } from './schema/channel-invitation.schema';

@Injectable()
export class ChannelInvitationRepository extends AbstractRepository<ChannelInvitation> {
  protected readonly logger = new Logger(ChannelRepository.name);
  constructor(
    @InjectModel(ChannelInvitation.name)
    protected readonly channelInvitationModel: Model<ChannelInvitation>,
  ) {
    super(channelInvitationModel);
  }

  async deleteOlderInvitations(
    workspaceId: string,
    channelId: string,
    senderEmail: string,
    receiverEmail: string,
  ) {
    return this.channelInvitationModel.deleteMany({
      workspaceId,
      channelId,
      senderEmail,
      receiverEmail,
    });
  }

  async sendInvitationToChannel(createInvitation: CreateInvitationDto) {
    const data: Omit<ChannelInvitation, '_id'> = {
      ...createInvitation,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
      // expired for 7 days
      expiredDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
    };

    await this.deleteOlderInvitations(
      data.workspaceId,
      data.channelId,
      data.senderEmail,
      data.receiverEmail,
    );

    try {
      const createdDocument = await this.create(data);
      return {
        code: 1,
        message: 'Successfully',
        data: createdDocument,
      };
    } catch (e) {
      console.log(e);
      return {
        code: 0,
        error: e,
      };
    }
  }

  async handleAcceptInvitation(_id: string) {
    const invitation = await this.findOne({ _id });
    if (!invitation) {
      return {
        code: -1,
        message: 'Invitation not found',
      };
    }
    if (invitation.expiredDate.getTime() < new Date().getTime()) {
      return {
        code: 0,
        message: 'Invitation expired',
      };
    }
    if (invitation.status === 'ACCEPTED') {
      return {
        code: 2,
        message: 'Invitation already accepted',
      };
    }
    const updatedDocument = await this.channelInvitationModel.findOneAndUpdate(
      {
        _id,
      },
      {
        status: 'ACCEPTED',
      },
    );
    return {
      code: 1,
      message: 'Accept invitation successfully',
      data: updatedDocument,
    };
  }
}
