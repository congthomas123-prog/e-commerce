import { Test } from '@nestjs/testing';
import { createSuccessResponse } from '@org/common';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  const profile = {
    id: 'user-1',
    email: 'user@example.com',
    fullName: 'Nguyen Van A',
    createdAt: new Date('2026-05-21T00:00:00.000Z'),
    updatedAt: new Date('2026-05-21T00:00:00.000Z'),
  };

  it('wraps create and findOne responses in the common success envelope', async () => {
    const usersService = {
      create: jest.fn().mockResolvedValue(profile),
      findOne: jest.fn().mockResolvedValue(profile),
      update: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile();

    const controller = moduleRef.get(UsersController);
    const dto: CreateUserDto = {
      email: 'user@example.com',
      fullName: 'Nguyen Van A',
    };

    await expect(controller.create(dto)).resolves.toEqual(
      createSuccessResponse(profile),
    );
    await expect(controller.findOne('user-1')).resolves.toEqual(
      createSuccessResponse(profile),
    );
  });

  it('wraps patch responses in the common success envelope', async () => {
    const usersService = {
      create: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn().mockResolvedValue(profile),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile();

    const controller = moduleRef.get(UsersController);
    const dto: UpdateUserDto = {
      fullName: 'Updated Name',
    };

    await expect(controller.update('user-1', dto)).resolves.toEqual(
      createSuccessResponse(profile),
    );
    expect(usersService.update).toHaveBeenCalledWith('user-1', dto);
  });
});
