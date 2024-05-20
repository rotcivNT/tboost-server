import { Injectable } from '@nestjs/common';
import { ChannelRepository } from './channel.repository';
import {
  CreateBookmarkDto,
  CreateBookmarkFolderDto,
} from './dto/create-bookmark.dto';
import { CreateChannelDto } from './dto/create-channel.dto';
import {
  UpdateBookmarkDto,
  UpdateBookmarkFolderDto,
} from './dto/update-bookmark.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { DeleteBookmarkDto } from './dto/delete-bookmark.dto';

@Injectable()
export class ChannelsService {
  constructor(private readonly channelRepository: ChannelRepository) {}

  async createChannel(createChannelDto: CreateChannelDto) {
    return this.channelRepository.create(createChannelDto);
  }

  findAll(workspaceID?: string, creatorID?: string) {
    return this.channelRepository.find({ workspaceID, creatorID });
  }

  findOne(_id: string) {
    return this.channelRepository.findOne({ _id });
  }

  update(updateChannelDto: UpdateChannelDto) {
    return this.channelRepository.findOneAndUpdate(
      { _id: updateChannelDto.id },
      updateChannelDto,
    );
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
}
