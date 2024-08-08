import { IsNotEmpty } from 'class-validator';

export class GetDirectConversationDto {
  @IsNotEmpty()
  memberClerkUserId: string;

  @IsNotEmpty()
  workspaceId: string;
}
