import { AbstractRepository } from '@app/common/database/abstract.repository';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreateBookmarkDto,
  CreateBookmarkFolderDto,
} from './dto/create-bookmark.dto';
import { DeleteBookmarkDto } from './dto/delete-bookmark.dto';
import {
  UpdateBookmarkDto,
  UpdateBookmarkFolderDto,
} from './dto/update-bookmark.dto';
import ChannelHelper from './helper/channel.helper';
import { Channel, ChannelMember } from './schema/channel.schema';

@Injectable()
export class ChannelRepository extends AbstractRepository<Channel> {
  protected readonly logger = new Logger(ChannelRepository.name);

  constructor(
    @InjectModel(Channel.name)
    protected readonly channelModel: Model<Channel>,
  ) {
    super(channelModel);
  }

  async createBookmark(
    _id: string,
    isFolder: boolean,
    payload: CreateBookmarkDto | CreateBookmarkFolderDto,
  ) {
    const channel = await this.channelModel.findOne({ _id });

    if (isFolder) {
      const res = await ChannelHelper.addBookmarkFolder(channel, payload.name);
      if (res.code === -1) {
        return res;
      }
      channel.bookmarkFolders.push(res.data);
    } else {
      const res = await ChannelHelper.addBookmark(
        channel,
        payload as CreateBookmarkDto,
      );

      if (res.code === -1) {
        return res;
      }
      // Add bookmark to folder
      if (res.folderIndex && res.folderIndex !== -1) {
        channel.bookmarkFolders[res.folderIndex] = res.updatedFolder;
      } else {
        channel.bookmarks.push(res.data);
      }
    }

    const savedDocument = await channel.save();
    return savedDocument.toJSON() as unknown as Channel;
  }

  async updateBookmark(
    _id: string,
    isFolder: boolean,
    payload: UpdateBookmarkDto | UpdateBookmarkFolderDto,
  ) {
    const channel = await this.channelModel.findOne({ _id });
    if (isFolder) {
      const res = await ChannelHelper.updateBookmarkFolder(
        channel,
        payload.previousName,
        payload.name,
      );

      if (res.code === -1) return res;
    } else {
      const res = await ChannelHelper.updateBookmark(
        channel,
        payload as UpdateBookmarkDto,
      );
      if (res.code === -1) return res;
    }
    const savedDocument = await channel.save();
    return savedDocument.toJSON() as unknown as Channel;
  }

  async deleteBookmark(_id: string, deleteBookmarkDto: DeleteBookmarkDto) {
    const { isFolder, bookmarkName, parentName } = deleteBookmarkDto;
    const channel = await this.channelModel.findOne({ _id });
    if (isFolder) {
      const res = await ChannelHelper.deleteBookmarkFolder(
        channel,
        bookmarkName,
      );
      if (res.code === -1) return res;
    } else {
      const res = await ChannelHelper.deleteBookmark(
        channel,
        bookmarkName,
        parentName,
      );
      if (res.code === -1) return res;
    }
    const savedDocument = await channel.save();
    return savedDocument.toJSON() as unknown as Channel;
  }

  async addMemberToChannel(_id: string, memberID: string) {
    const channel = await this.channelModel.findOne({ _id });
    const data: ChannelMember = {
      userID: memberID,
      joinedAt: new Date(),
    };
    channel.members = [...channel.members, data];

    const savedDocument = await channel.save();
    return savedDocument.toJSON() as unknown as Channel;
  }
}
