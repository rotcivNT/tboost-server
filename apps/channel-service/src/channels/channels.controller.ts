import { PusherService } from '@app/common/pusher/pusher.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { EventPattern } from '@nestjs/microservices';

@Controller('channels')
export class ChannelsController {
  constructor(
    private readonly channelsService: ChannelsService,
    private pusherService: PusherService,
  ) {}

  @Post()
  create(@Body() createChannelDto: CreateChannelDto) {
    return this.channelsService.createChannel(createChannelDto);
  }

  @Get()
  findAll(@Query() queries: any) {
    const workspaceID = queries.workspaceID;
    const userID = queries.creatorID;
    return this.channelsService.findAll(workspaceID, userID);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.channelsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') channelId: string,
    @Body() updateChannelDto: UpdateChannelDto,
  ) {
    const updatedDoc = await this.channelsService.update(
      channelId,
      updateChannelDto,
    );
    if (updatedDoc._id) {
      await this.pusherService.trigger(
        channelId,
        'update-channel',
        updatedDoc,
        updateChannelDto.socketId,
      );
    }
    return updatedDoc;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.channelsService.remove(id);
  }

  @Post('/send-invitation')
  sendInvitationToChannel(@Body() createInvitation: CreateInvitationDto) {
    return this.channelsService.sendInvitationToChannel(createInvitation);
  }
  @Post('/accept-invitation')
  async acceptInvitation(@Body() dto: any) {
    const res = await this.channelsService.acceptInvitation(dto.invitationId);
    if (res.code === 1) {
      await this.pusherService.trigger(
        res.data.channelId,
        'new-member-joined',
        res,
      );
    }
    return res;
  }

  @EventPattern('message-delivery')
  async handleNewMessage(data: any) {
    if (data) {
      if (data?.type === 'update') {
        console.log('TRIGGER UPDATE', data);

        await this.pusherService.trigger(
          data.channelId,
          'update-message',
          data.message,
          data.socketId,
        );
      } else
        await this.pusherService.trigger(
          data.channelId,
          'new-message',
          data.message,
          data.socketId,
        );
    }
  }
}
