export enum MessageType {
  TEXT = 'text',
  VIDEO = 'video',
  FILE = 'file',
  IMAGE = 'image',
  LINK = 'link',
  SYSTEM = 'system',
  MEETING = 'meeting',
}

export const LIMIT_MESSAGE = 20;

export enum CLERK_WEBHOOK_EVENT_TYPE {
  USER_CREATED = 'user.created',
  ORGANIZATION_MEMBER_CREATED = 'organizationMembership.created',
  USER_UPDATED = 'user.updated',
}
