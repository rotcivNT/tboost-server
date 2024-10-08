import { AbstractDocument } from '@app/common/database/abstract.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BookmarkFolder } from './types/bookmark-folder.type';
import { Bookmark } from './types/bookmark.type';

export type ChannelDocument = HydratedDocument<Channel>;

export class ChannelMember {
  userID: string;

  joinedAt: Date;
}

@Schema({
  versionKey: false,
})
export class Channel extends AbstractDocument {
  // id, name, description, type, creatorID, members, createdAt, updatedAt, topic, bookmark, folderBookmark, deletedAt

  @Prop({ required: true, minlength: 1 })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  isPublic: boolean;

  @Prop({ required: true })
  creatorID: string;

  @Prop({ required: true })
  workspaceID: string;

  @Prop({
    index: false,
    type: [ChannelMember],
  })
  members: ChannelMember[];

  @Prop()
  topic: string;

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

export const ChannelSchema = SchemaFactory.createForClass(Channel);

ChannelSchema.index(
  { workspaceID: 1, creatorID: 1, name: 1 },
  { unique: true },
);
