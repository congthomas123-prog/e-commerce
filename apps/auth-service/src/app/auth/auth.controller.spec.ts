import { Test } from '@nestjs/testing';
import { createSuccessResponse } from '@org/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import type { LoginDto } from './dto/login.dto';
import type { RefreshTokenDto } from './dto/refresh-token.dto';
import type { RegisterDto } from './dto/register.dto';

describe('AuthController', () => {
  const authResponse = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    user: {
      id: 'user-1',
      email: 'user@example.com',
      fullName: 'Nguyen Van A',
    },
  };

  it('wraps register responses in the common success envelope', async () => {
    const authService = {
      register: jest.fn().mockResolvedValue(authResponse),
      login: jest.fn(),
      refresh: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    const controller = moduleRef.get(AuthController);
    const dto: RegisterDto = {
      email: 'user@example.com',
      password: 'StrongPass123',
      fullName: 'Nguyen Van A',
    };

    await expect(controller.register(dto)).resolves.toEqual(
      createSuccessResponse(authResponse),
    );
    expect(authService.register).toHaveBeenCalledWith(dto);
  });

  it('wraps login and refresh responses in the common success envelope', async () => {
    const authService = {
      register: jest.fn(),
      login: jest.fn().mockResolvedValue(authResponse),
      refresh: jest.fn().mockResolvedValue(authResponse),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    const controller = moduleRef.get(AuthController);
    const loginDto: LoginDto = {
      email: 'user@example.com',
      password: 'StrongPass123',
    };
    const refreshDto: RefreshTokenDto = {
      refreshToken: 'refresh-token',
    };

    await expect(controller.login(loginDto)).resolves.toEqual(
      createSuccessResponse(authResponse),
    );
    await expect(controller.refresh(refreshDto)).resolves.toEqual(
      createSuccessResponse(authResponse),
    );
  });
});
