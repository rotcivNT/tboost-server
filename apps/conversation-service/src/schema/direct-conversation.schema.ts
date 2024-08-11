import { AbstractDocument } from '@app/common/database/abstract.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BookmarkFolder } from '../types/bookmark-folder.type';
import { Bookmark } from '../types/bookmark.type';
import { ConversationType } from '../types/conversation.type';

export type DirectConversationDocument = HydratedDocument<DirectConversation>;

@Schema({
  versionKey: false,
  collection: 'direct-conversations',
})
export class DirectConversation extends AbstractDocument {
  @Prop({ required: true, type: String, enum: Object.values(ConversationType) })
  type: ConversationType;

  @Prop({ required: true })
  workspaceId: string;

  @Prop()
  topic: string;

  @Prop({ required: true, type: [String], length: 2 })
  members: string[];

  @Prop([Bookmark])
  bookmarks: Bookmark[];

  @Prop([BookmarkFolder])
  bookmarkFolders: BookmarkFolder[];

  @Prop({ required: true, default: new Date() })
  createdAt: Date;

  @Prop()
  deletedAt: Date;

  @Prop({ required: true, default: new Date() })
  updatedAt: Date;
}

export const DirectConversationSchema =
  SchemaFactory.createForClass(DirectConversation);

DirectConversationSchema.index({ workspaceId: 1 });
