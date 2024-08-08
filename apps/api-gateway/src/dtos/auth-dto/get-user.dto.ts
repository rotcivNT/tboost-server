import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty } from 'class-validator';

export enum FindBy {
  CLERK_USER_ID = 'clerkUserId',
  EMAIL = 'email',
}

export class GetUserDto {
  @IsNotEmpty()
  @ApiProperty({
    oneOf: [{ type: 'array', items: { type: 'string' } }, { type: 'string' }],
  })
  field: string | string[];

  @IsNotEmpty()
  @ApiProperty({ enum: FindBy })
  @IsIn(Object.values(FindBy))
  findBy: FindBy;
}
