import { clerkClient } from '@clerk/clerk-sdk-node';
import { Injectable } from '@nestjs/common';
import { ChannelInvitationRepository } from './channel-invitation.repository';
import { ChannelRepository } from './channel.repository';
import {
  CreateBookmarkDto,
  CreateBookmarkFolderDto,
} from './dto/create-bookmark.dto';
import { CreateChannelDto } from './dto/create-channel.dto';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { DeleteBookmarkDto } from './dto/delete-bookmark.dto';
import {
  UpdateBookmarkDto,
  UpdateBookmarkFolderDto,
} from './dto/update-bookmark.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';

@Injectable()
export class ChannelsService {
  constructor(
    private readonly channelRepository: ChannelRepository,
    private readonly channelInvitationRepository: ChannelInvitationRepository,
  ) {}

  async createChannel(createChannelDto: CreateChannelDto) {
    return this.channelRepository.create(createChannelDto);
  }

  findAll(workspaceID?: string, userID?: string) {
    return this.channelRepository.find({
      workspaceID,
      members: {
        $elemMatch: { userID: userID },
      },
    });
  }

  findOne(_id: string) {
    return this.channelRepository.findOne({ _id });
  }

  async update(_id: string, updateChannelDto: UpdateChannelDto) {
    return this.channelRepository.findOneAndUpdate({ _id }, updateChannelDto);
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
    return this.channelInvitationRepository.sendInvitationToChannel(payload);
  }

  async acceptInvitation(_id: string) {
    try {
      const res =
        await this.channelInvitationRepository.handleAcceptInvitation(_id);

      if (res.code === 1) {
        const { data } = await clerkClient.users.getUserList({
          emailAddress: res.data.receiverEmail,
        });
        const document = await this.channelRepository.addMemberToChannel(
          res.data.channelId,
          data[0].id,
        );
        return {
          ...res,
          members: document.members,
          newMemberId: data[0].id,
        };
      }
      return res;
    } catch (e) {
      console.log(e);
    }
  }

  async handleNewMessage(data: any) {
    console.log(data);
  }
}
