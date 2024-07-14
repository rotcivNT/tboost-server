import { clerkClient } from '@clerk/clerk-sdk-node';
import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RemoveUserDto } from 'apps/api-gateway/src/dtos/channel-dto/remove-user.dto';
import { ChannelInvitationRepository } from './channel-invitation.repository';
import { ChannelRepository } from './channel.repository';
import {
  CreateBookmarkDto,
  CreateBookmarkFolderDto,
} from './dto/create-bookmark.dto';
import { CreateChannelDto } from './dto/create-channel.dto';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import {
  UpdateBookmarkDto,
  UpdateBookmarkFolderDto,
} from './dto/update-bookmark.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { DeleteBookmarkDto } from 'apps/api-gateway/src/dtos/channel-dto/delete-bookmark.dto';

@Injectable()
export class ChannelsService {
  constructor(
    private readonly channelRepository: ChannelRepository,
    private readonly channelInvitationRepository: ChannelInvitationRepository,
    private readonly mailService: MailerService,
  ) {}

  async createChannel(createChannelDto: CreateChannelDto) {
    try {
      return this.channelRepository.create(createChannelDto);
    } catch (e) {
      throw new BadRequestException();
    }
  }

  async findAll(workspaceID?: string, userID?: string) {
    try {
      const res = await this.channelRepository.find({
        workspaceID,
        members: {
          $elemMatch: { userID: userID },
        },
      });
      if (res.length === 0)
        throw new NotFoundException(
          `Not found channel with workspaceID: ${workspaceID} of user ${userID}`,
        );
      return res;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  findOne(_id: string) {
    return this.channelRepository.findOne({ _id });
  }

  async update(_id: string, updateChannelDto: UpdateChannelDto) {
    try {
      const res = await this.channelRepository.findOneAndUpdate(
        { _id },
        updateChannelDto,
      );
      return res;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  remove(_id: string) {
    return this.channelRepository.findOneAndDelete({ _id });
  }

  async createBookmark(
    channelId: string,
    isFolder: boolean,
    payload: CreateBookmarkDto | CreateBookmarkFolderDto,
  ) {
    return this.channelRepository.createBookmark(channelId, isFolder, payload);
  }

  async updateBookmark(
    channelId: string,
    isFolder: boolean,
    payload: UpdateBookmarkDto | UpdateBookmarkFolderDto,
  ) {
    return this.channelRepository.updateBookmark(channelId, isFolder, payload);
  }

  async deleteBookmark(channelId: string, payload: DeleteBookmarkDto) {
    return this.channelRepository.deleteBookmark(channelId, payload);
  }

  async sendInvitationToChannel(payload: CreateInvitationDto) {
    try {
      const res =
        await this.channelInvitationRepository.sendInvitationToChannel(payload);
      const redirectUrl = `${process.env.FRONT_END_HOST}/channel-invitation/${res.data._id}`;
      const memberShips =
        await clerkClient.organizations.getOrganizationMembershipList({
          organizationId: payload.workspaceId,
        });
      const user = await clerkClient.users.getUserList({
        emailAddress: [payload.receiverEmail],
      });

      const alreadyMember =
        user.totalCount > 0
          ? memberShips.data.find(
              (member) => member.publicUserData.userId === user.data[0].id,
            )
          : false;

      if (alreadyMember) {
        const message = `
        <a href="${redirectUrl}">
        Accept (expired in 7 days)
        </a>
    `;
        this.mailService.sendMail({
          from: payload.senderEmail,
          to: payload.receiverEmail,
          subject: 'Invite to channel !',
          html: message,
        });
      } else {
        await clerkClient.organizations.createOrganizationInvitation({
          emailAddress: payload.receiverEmail,
          redirectUrl,
          inviterUserId: payload.senderId,
          organizationId: payload.workspaceId,
          role: payload.role,
        });
      }

      return res;
    } catch (e) {
      console.log(e);
    }
  }

  async acceptInvitation(_id: string): Promise<any> {
    try {
      const res =
        await this.channelInvitationRepository.handleAcceptInvitation(_id);

      if (res.code === 1) {
        const { data } = await clerkClient.users.getUserList({
          emailAddress: [res.data.receiverEmail],
        });
        const document = await this.channelRepository.addMemberToChannel(
          res.data.channelId,
          data[0].id,
        );
        return {
          ...res,
          members: document.members,
          newMemberId: data[0].id,
          fullName: data[0].fullName,
          imageUrl: data[0].imageUrl,
          channelId: res.data.channelId,
        };
      }
      return res;
    } catch (e) {
      console.log(e);
    }
  }

  async removeUserFromChannel(deleteUserDto: RemoveUserDto) {
    return this.channelRepository.removeMemberFromChannel(deleteUserDto);
  }
}
