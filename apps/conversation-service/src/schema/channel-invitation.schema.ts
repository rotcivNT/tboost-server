import { AbstractDocument } from '@app/common/database/abstract.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey: false, collection: 'channel-invitation' })
export class ChannelInvitation extends AbstractDocument {
  // _id, workspaceId, channelId, senderEmail, receiverEmail, role, status, expiredDate, createdAt, updatedAt

  @Prop({ required: true })
  workspaceId: string;

  @Prop({ required: true })
  channelId: string;

  @Prop({ required: true })
  senderEmail: string;

  @Prop({ required: true })
  receiverEmail: string;

  @Prop({ required: true })
  role: string;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  expiredDate: Date;

  @Prop({ default: new Date() })
  createdAt: Date;

  @Prop({ default: new Date() })
  updatedAt: Date;
}

export const ChannelInvitationSchema =
  SchemaFactory.createForClass(ChannelInvitation);
