import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from 'apps/api-gateway/src/dtos/auth-dto/create-user.dto';
import { GetUserResponseDto } from 'apps/auth-service/src/dto/response-dto/get-user-response.dto';
import { AuthRepository } from './auth.repository';
import { CreateUserResponseDto } from 'apps/auth-service/src/dto/response-dto/create-user-response.dto';
import { ApiStatus } from 'apps/api-gateway/src/types/api-status';

@Injectable()
export class AuthsService {
  constructor(private readonly authRepository: AuthRepository) {}

  async createUser(
    createUserDto: CreateUserDto,
  ): Promise<CreateUserResponseDto> {
    const createdUser = await this.authRepository.create(createUserDto);
    if (!createdUser) {
      return {
        data: null,
        message: 'User not created',
        status: ApiStatus.ERROR,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
    return {
      data: createdUser,
      message: 'User created successfully',
      status: ApiStatus.OK,
      statusCode: HttpStatus.CREATED,
    };
  }

  async findUserByClerkUserId(
    clerkUserId: string | string[],
  ): Promise<GetUserResponseDto> {
    clerkUserId = Array.isArray(clerkUserId) ? clerkUserId : [clerkUserId];
    const users = await this.authRepository.find({
      clerkUserId: {
        $in: clerkUserId,
      },
    });
    if (users.length === 0) {
      return {
        data: null,
        message: 'User not found',
        status: ApiStatus.ERROR,
        statusCode: HttpStatus.NOT_FOUND,
      };
    }
    return {
      data: users,
      message: 'success',
      status: ApiStatus.OK,
      statusCode: HttpStatus.OK,
    };
  }

  async findUserByEmail(email: string | string[]): Promise<GetUserResponseDto> {
    email = Array.isArray(email) ? email : [email];
    const users = await this.authRepository.find({
      email: {
        $in: email,
      },
    });
    if (users.length === 0) {
      return {
        data: null,
        message: 'User not found',
        status: ApiStatus.ERROR,
        statusCode: HttpStatus.NOT_FOUND,
      };
    }
    return {
      data: users,
      message: 'success',
      status: ApiStatus.OK,
      statusCode: HttpStatus.OK,
    };
  }

  async findAllUsers(): Promise<GetUserResponseDto> {
    const users = await this.authRepository.find({});
    if (users.length === 0) {
      return {
        data: null,
        message: 'User not found',
        status: ApiStatus.ERROR,
        statusCode: HttpStatus.NOT_FOUND,
      };
    }
    return {
      data: users,
      message: 'success',
      status: ApiStatus.OK,
      statusCode: HttpStatus.OK,
    };
  }

  async updateUserAvatar(clerkUserId: string, imageUrl: string) {
    const user = await this.authRepository.findOneAndUpdate(
      { clerkUserId },
      { imageUrl },
    );
    if (!user) {
      return {
        data: null,
        message: 'User not found',
        status: ApiStatus.ERROR,
        statusCode: HttpStatus.NOT_FOUND,
      };
    }
    return {
      data: user,
      message: 'User updated',
      status: ApiStatus.OK,
      statusCode: HttpStatus.OK,
    };
  }
}
