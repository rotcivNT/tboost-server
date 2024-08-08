import { ConversationType } from 'apps/conversation-service/src/conversation/types/conversation.type';
import { ArrayMaxSize, ArrayMinSize, IsIn, IsNotEmpty } from 'class-validator';

export class CreateDirectConversationDto {
  @IsNotEmpty()
  workspaceId: string;

  @IsNotEmpty()
  @IsIn(Object.values(ConversationType))
  type: ConversationType;

  @IsNotEmpty()
  @ArrayMinSize(1)
  @ArrayMaxSize(2)
  members: string[];
}
