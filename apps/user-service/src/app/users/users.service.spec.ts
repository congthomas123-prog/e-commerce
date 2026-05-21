import { ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@org/database';
import { USER_ERROR_CODES } from './constants/user-error-codes.constants';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

describe('UsersService', () => {
  const createUserDto: CreateUserDto = {
    email: 'USER@Example.com',
    fullName: 'Nguyen Van A',
  };

  const updateUserDto: UpdateUserDto = {
    email: 'UPDATED@Example.com',
    fullName: 'Updated Name',
  };

  const userProfile = {
    id: 'user-1',
    email: 'user@example.com',
    fullName: 'Nguyen Van A',
    createdAt: new Date('2026-05-21T00:00:00.000Z'),
    updatedAt: new Date('2026-05-21T00:00:00.000Z'),
  };

  function createSubject() {
    const prismaClient = {
      userProfile: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const prismaService = {
      instance: prismaClient,
    } as unknown as PrismaService;

    return {
      prismaClient,
      service: new UsersService(prismaService),
    };
  }

  it('creates a user profile, normalizes email, and returns the stored record', async () => {
    const subject = createSubject();
    subject.prismaClient.userProfile.findUnique.mockResolvedValue(null);
    subject.prismaClient.userProfile.create.mockResolvedValue(userProfile);

    await expect(subject.service.create(createUserDto)).resolves.toEqual(userProfile);
    expect(subject.prismaClient.userProfile.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: 'user@example.com',
        fullName: 'Nguyen Van A',
      }),
    });
  });

  it('rejects duplicate email addresses during create', async () => {
    const subject = createSubject();
    subject.prismaClient.userProfile.findUnique.mockResolvedValue(userProfile);
    const result = subject.service.create(createUserDto);

    await expect(result).rejects.toBeInstanceOf(ConflictException);
    await expect(result).rejects.toMatchObject({
      response: expect.objectContaining({
        errorCode: USER_ERROR_CODES.emailAlreadyExists,
      }),
    });
  });

  it('returns a user profile by id', async () => {
    const subject = createSubject();
    subject.prismaClient.userProfile.findUnique.mockResolvedValue(userProfile);

    await expect(subject.service.findOne('user-1')).resolves.toEqual(userProfile);
  });

  it('rejects missing user profiles during lookup', async () => {
    const subject = createSubject();
    subject.prismaClient.userProfile.findUnique.mockResolvedValue(null);
    const result = subject.service.findOne('missing-user');

    await expect(result).rejects.toBeInstanceOf(NotFoundException);
    await expect(result).rejects.toMatchObject({
      response: expect.objectContaining({
        errorCode: USER_ERROR_CODES.profileNotFound,
      }),
    });
  });

  it('updates fullName and normalized email for an existing user profile', async () => {
    const subject = createSubject();
    subject.prismaClient.userProfile.findUnique
      .mockResolvedValueOnce(userProfile)
      .mockResolvedValueOnce(null);
    subject.prismaClient.userProfile.update.mockResolvedValue({
      ...userProfile,
      email: 'updated@example.com',
      fullName: 'Updated Name',
      updatedAt: new Date('2026-05-21T01:00:00.000Z'),
    });

    await expect(subject.service.update('user-1', updateUserDto)).resolves.toEqual({
      ...userProfile,
      email: 'updated@example.com',
      fullName: 'Updated Name',
      updatedAt: new Date('2026-05-21T01:00:00.000Z'),
    });
    expect(subject.prismaClient.userProfile.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: {
        email: 'updated@example.com',
        fullName: 'Updated Name',
      },
    });
  });

  it('rejects duplicate email addresses during update', async () => {
    const subject = createSubject();
    subject.prismaClient.userProfile.findUnique
      .mockResolvedValueOnce(userProfile)
      .mockResolvedValueOnce({ ...userProfile, id: 'user-2', email: 'updated@example.com' });
    const result = subject.service.update('user-1', updateUserDto);

    await expect(result).rejects.toBeInstanceOf(ConflictException);
    await expect(result).rejects.toMatchObject({
      response: expect.objectContaining({
        errorCode: USER_ERROR_CODES.emailAlreadyExists,
      }),
    });
  });

  it('rejects updates for missing user profiles', async () => {
    const subject = createSubject();
    subject.prismaClient.userProfile.findUnique.mockResolvedValue(null);
    const result = subject.service.update('missing-user', updateUserDto);

    await expect(result).rejects.toBeInstanceOf(NotFoundException);
    await expect(result).rejects.toMatchObject({
      response: expect.objectContaining({
        errorCode: USER_ERROR_CODES.profileNotFound,
      }),
    });
  });
});
