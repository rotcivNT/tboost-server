export enum ConversationType {
  DIRECT_MESSAGE = 'conversation.direct-message',
  CHANNEL = 'conversation.channel',
}

export class ConversationMember {
  userID: string;
  joinedAt: Date;
}
