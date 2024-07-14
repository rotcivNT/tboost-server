import { IsEmail, IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateInvitationDto {
  @IsNotEmpty()
  @IsString()
  workspaceId: string;

  @IsNotEmpty()
  @IsString()
  channelId: string;

  @IsNotEmpty()
  @IsEmail()
  senderEmail: string;

  @IsNotEmpty()
  @IsEmail()
  receiverEmail: string;

  @IsString()
  @IsIn(['org:member', 'org:admin'])
  role: string;
}
