import { ConversationType } from 'apps/conversation-service/src/types/conversation.type';
import { IsIn, IsNotEmpty, IsOptional } from 'class-validator';

export class DeleteBookmarkDto {
  @IsNotEmpty()
  isFolder: boolean;

  @IsNotEmpty()
  bookmarkName: string;

  @IsOptional()
  parentName: string;

  @IsNotEmpty()
  @IsIn([ConversationType.CHANNEL, ConversationType.DIRECT_MESSAGE])
  type: ConversationType;
}
