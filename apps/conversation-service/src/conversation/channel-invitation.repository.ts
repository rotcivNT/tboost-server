import { AbstractRepository } from '@app/common/database/abstract.repository';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChannelRepository } from './channel.repository';
import { ChannelInvitation } from './schema/channel-invitation.schema';
import { CreateInvitationDto } from 'apps/api-gateway/src/dtos/conversation-dto/channel-dto/create-invitation.dto';
import { SendInvitationReponseDto } from 'apps/conversation-service/src/conversation/dto/response-dto/send-invitation-reponse.dto';
import { ApiStatus } from 'apps/api-gateway/src/types/api-status';
import { AcceptInvitationResponseDto } from 'apps/conversation-service/src/conversation/dto/response-dto/accept-invitation-response.dto';

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

  async sendInvitationToChannel(
    createInvitation: CreateInvitationDto,
  ): Promise<SendInvitationReponseDto> {
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

    const createdDocument = await this.create(data);
    if (!createdDocument) {
      return {
        data: null,
        message: 'Send invitation failed',
        status: ApiStatus.ERROR,
        statusCode: HttpStatus.BAD_REQUEST,
      };
    }
    return {
      message: 'Success',
      data: createdDocument,
      statusCode: HttpStatus.CREATED,
      status: ApiStatus.OK,
    };
  }

  async handleAcceptInvitation(
    _id: string,
  ): Promise<AcceptInvitationResponseDto> {
    const invitation = await this.findOne({ _id });
    if (!invitation) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        status: ApiStatus.ERROR,
        data: null,
        message: 'Invitation not found',
      };
    }
    if (invitation.expiredDate.getTime() < new Date().getTime()) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        status: ApiStatus.ERROR,
        data: null,
        message: 'Invitation expired',
      };
    }
    if (invitation.status === 'ACCEPTED') {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        status: ApiStatus.ERROR,
        data: null,
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
      statusCode: HttpStatus.ACCEPTED,
      status: ApiStatus.OK,
      message: 'Accept invitation successfully',
      data: updatedDocument,
    };
  }
}
