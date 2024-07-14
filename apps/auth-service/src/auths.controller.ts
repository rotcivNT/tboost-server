import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { CreateUserDto } from 'apps/api-gateway/src/dtos/auth-dto/create-user.dto';
import { AuthsService } from './auths.service';

@Controller()
export class AuthsController {
  constructor(private readonly authsService: AuthsService) {}

  @EventPattern('create-user')
  createUser(createUserDto: CreateUserDto) {
    try {
      return this.authsService.createUser(createUserDto);
    } catch (e) {
      console.log(e);
    }
  }

  @MessagePattern({ cmd: 'get-user' })
  findUser(clerkUserId: string) {
    try {
      return this.authsService.findUser(clerkUserId);
    } catch (e) {
      console.log(e);
    }
  }
}
