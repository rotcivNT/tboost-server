import { Controller, Get } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { CreateUserDto } from 'apps/api-gateway/src/dtos/auth-dto/create-user.dto';
import {
  FindBy,
  GetUserDto,
} from 'apps/api-gateway/src/dtos/auth-dto/get-user.dto';
import { AuthsService } from './auths.service';
import { UpdateUserDto } from 'apps/api-gateway/src/dtos/auth-dto/update-user.dto';

@Controller()
export class AuthsController {
  constructor(private readonly authsService: AuthsService) {}

  @Get('/cron-job')
  cronJob() {
    return 'CRON-JOB';
  }
  @EventPattern('create-user')
  createUser(createUserDto: CreateUserDto) {
    try {
      return this.authsService.createUser(createUserDto);
    } catch (e) {
      console.log(e);
    }
  }

  @MessagePattern({ cmd: 'get-user' })
  findUser(getUserDto: GetUserDto) {
    switch (getUserDto.findBy) {
      case FindBy.EMAIL:
        return this.authsService.findUserByEmail(getUserDto.field);
      case FindBy.CLERK_USER_ID:
        return this.authsService.findUserByClerkUserId(getUserDto.field);
    }
  }

  @MessagePattern({ cmd: 'get-all-users' })
  findAllUsers() {
    return this.authsService.findAllUsers();
  }

  @EventPattern('update-user')
  updateUser(updateUserDto: UpdateUserDto) {
    const { clerkUserId, imageUrl } = updateUserDto;
    return this.authsService.updateUserAvatar(clerkUserId, imageUrl);
  }
}
