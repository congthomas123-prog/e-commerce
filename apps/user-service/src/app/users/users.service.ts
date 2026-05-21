import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@org/database';
import { randomUUID } from 'node:crypto';
import type { PrismaClient, UserProfile } from '../../generated/prisma';
import { USER_ERROR_CODES } from './constants/user-error-codes.constants';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';
import type { UserProfileResponse } from './types/user-profile.types';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: CreateUserDto): Promise<UserProfileResponse> {
    const email = this.normalizeEmail(dto.email);
    const existingProfile = await this.prisma.userProfile.findUnique({
      where: { email },
    });

    if (existingProfile) {
      throw this.createEmailAlreadyExistsException();
    }

    const createdProfile = await this.prisma.userProfile.create({
      data: {
        id: randomUUID(),
        email,
        fullName: dto.fullName,
      },
    });

    return this.toUserProfileResponse(createdProfile);
  }

  async findOne(id: string): Promise<UserProfileResponse> {
    const profile = await this.prisma.userProfile.findUnique({
      where: { id },
    });

    if (!profile) {
      throw this.createProfileNotFoundException();
    }

    return this.toUserProfileResponse(profile);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserProfileResponse> {
    const existingProfile = await this.prisma.userProfile.findUnique({
      where: { id },
    });

    if (!existingProfile) {
      throw this.createProfileNotFoundException();
    }

    const email = dto.email ? this.normalizeEmail(dto.email) : undefined;

    if (email && email !== existingProfile.email) {
      const duplicateProfile = await this.prisma.userProfile.findUnique({
        where: { email },
      });

      if (duplicateProfile) {
        throw this.createEmailAlreadyExistsException();
      }
    }

    const updatedProfile = await this.prisma.userProfile.update({
      where: { id },
      data: {
        ...(email ? { email } : {}),
        ...(dto.fullName ? { fullName: dto.fullName } : {}),
      },
    });

    return this.toUserProfileResponse(updatedProfile);
  }

  private createEmailAlreadyExistsException(): ConflictException {
    return new ConflictException({
      message: 'Email already exists.',
      errorCode: USER_ERROR_CODES.emailAlreadyExists,
    });
  }

  private createProfileNotFoundException(): NotFoundException {
    return new NotFoundException({
      message: 'User profile not found.',
      errorCode: USER_ERROR_CODES.profileNotFound,
    });
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private toUserProfileResponse(profile: UserProfile): UserProfileResponse {
    return {
      id: profile.id,
      email: profile.email,
      fullName: profile.fullName,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  private get prisma(): PrismaClient {
    return this.prismaService.instance as PrismaClient;
  }
}
