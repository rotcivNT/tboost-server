import { Injectable } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { CreateUserDto } from 'apps/api-gateway/src/dtos/auth-dto/create-user.dto';

@Injectable()
export class AuthsService {
  constructor(private readonly authRepository: AuthRepository) {}

  createUser(createUserDto: CreateUserDto) {
    return this.authRepository.create(createUserDto);
  }

  findUser(clerkUserId: string) {
    return this.authRepository.findOne({
      clerkUserId,
    });
  }
}
