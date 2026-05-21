import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@org/database';
import { AuthService } from './auth.service';
import { AUTH_ERROR_CODES } from './constants/auth-error-codes.constants';
import type { LoginDto } from './dto/login.dto';
import type { RefreshTokenDto } from './dto/refresh-token.dto';
import type { RegisterDto } from './dto/register.dto';
import { AuthTokenService } from './services/auth-token.service';
import { PasswordService } from './services/password.service';

describe('AuthService', () => {
  const registerDto: RegisterDto = {
    email: 'user@example.com',
    password: 'StrongPass123',
    fullName: 'Nguyen Van A',
  };

  const loginDto: LoginDto = {
    email: 'user@example.com',
    password: 'StrongPass123',
  };

  const refreshDto: RefreshTokenDto = {
    refreshToken: 'refresh-token',
  };

  const userRecord = {
    id: 'user-1',
    email: 'user@example.com',
    fullName: 'Nguyen Van A',
    passwordHash: 'hashed-password',
    refreshTokenHash: 'hashed-refresh-token',
    createdAt: new Date('2026-05-21T00:00:00.000Z'),
    updatedAt: new Date('2026-05-21T00:00:00.000Z'),
  };

  function createSubject() {
    const prismaClient = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const prismaService = {
      instance: prismaClient,
    } as unknown as PrismaService;

    const tokenService = {
      issueTokens: jest.fn(),
      verifyRefreshToken: jest.fn(),
    } as {
      issueTokens: jest.MockedFunction<AuthTokenService['issueTokens']>;
      verifyRefreshToken: jest.MockedFunction<AuthTokenService['verifyRefreshToken']>;
    };

    const passwordService = {
      hash: jest.fn(),
      compare: jest.fn(),
    } as {
      hash: jest.MockedFunction<PasswordService['hash']>;
      compare: jest.MockedFunction<PasswordService['compare']>;
    };

    return {
      prismaClient,
      tokenService,
      passwordService,
      service: new AuthService(
        prismaService,
        tokenService as unknown as AuthTokenService,
        passwordService as unknown as PasswordService,
      ),
    };
  }

  it('registers a new user, hashes secrets, and returns a token pair', async () => {
    const subject = createSubject();
    subject.prismaClient.user.findUnique.mockResolvedValue(null);
    subject.tokenService.issueTokens.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    subject.passwordService.hash
      .mockResolvedValueOnce('hashed-password')
      .mockResolvedValueOnce('hashed-refresh-token');
    subject.prismaClient.user.create.mockResolvedValue(userRecord);

    await expect(subject.service.register(registerDto)).resolves.toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: {
        id: 'user-1',
        email: 'user@example.com',
        fullName: 'Nguyen Van A',
      },
    });

    expect(subject.prismaClient.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: 'user@example.com',
        fullName: 'Nguyen Van A',
        passwordHash: 'hashed-password',
        refreshTokenHash: 'hashed-refresh-token',
      }),
    });
  });

  it('rejects duplicate registration attempts', async () => {
    const subject = createSubject();
    subject.prismaClient.user.findUnique.mockResolvedValue(userRecord);

    await expect(subject.service.register(registerDto)).rejects.toBeInstanceOf(
      ConflictException,
    );
    await expect(subject.service.register(registerDto)).rejects.toMatchObject({
      response: expect.objectContaining({
        errorCode: AUTH_ERROR_CODES.emailAlreadyExists,
      }),
    });
  });

  it('logs a user in, rotates the refresh token hash, and returns new tokens', async () => {
    const subject = createSubject();
    subject.prismaClient.user.findUnique.mockResolvedValue(userRecord);
    subject.passwordService.compare.mockResolvedValueOnce(true);
    subject.tokenService.issueTokens.mockResolvedValue({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });
    subject.passwordService.hash.mockResolvedValue('new-refresh-token-hash');
    subject.prismaClient.user.update.mockResolvedValue({
      ...userRecord,
      refreshTokenHash: 'new-refresh-token-hash',
    });

    await expect(subject.service.login(loginDto)).resolves.toEqual({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      user: {
        id: 'user-1',
        email: 'user@example.com',
        fullName: 'Nguyen Van A',
      },
    });

    expect(subject.prismaClient.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { refreshTokenHash: 'new-refresh-token-hash' },
    });
  });

  it('rejects logins with invalid credentials', async () => {
    const subject = createSubject();
    subject.prismaClient.user.findUnique.mockResolvedValue(userRecord);
    subject.passwordService.compare.mockResolvedValue(false);

    await expect(subject.service.login(loginDto)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    await expect(subject.service.login(loginDto)).rejects.toMatchObject({
      response: expect.objectContaining({
        errorCode: AUTH_ERROR_CODES.invalidCredentials,
      }),
    });
  });

  it('refreshes tokens, validates the stored refresh token hash, and rotates it', async () => {
    const subject = createSubject();
    subject.tokenService.verifyRefreshToken.mockResolvedValue({
      sub: 'user-1',
      email: 'user@example.com',
    });
    subject.prismaClient.user.findUnique.mockResolvedValue(userRecord);
    subject.passwordService.compare.mockResolvedValueOnce(true);
    subject.tokenService.issueTokens.mockResolvedValue({
      accessToken: 'rotated-access-token',
      refreshToken: 'rotated-refresh-token',
    });
    subject.passwordService.hash.mockResolvedValue('rotated-refresh-token-hash');
    subject.prismaClient.user.update.mockResolvedValue({
      ...userRecord,
      refreshTokenHash: 'rotated-refresh-token-hash',
    });

    await expect(subject.service.refresh(refreshDto)).resolves.toEqual({
      accessToken: 'rotated-access-token',
      refreshToken: 'rotated-refresh-token',
      user: {
        id: 'user-1',
        email: 'user@example.com',
        fullName: 'Nguyen Van A',
      },
    });
  });

  it('rejects malformed refresh tokens', async () => {
    const subject = createSubject();
    subject.tokenService.verifyRefreshToken.mockRejectedValue(new Error('jwt malformed'));

    await expect(subject.service.refresh(refreshDto)).rejects.toMatchObject({
      response: expect.objectContaining({
        errorCode: AUTH_ERROR_CODES.refreshTokenInvalid,
      }),
    });
  });

  it('rejects expired refresh tokens with a dedicated code', async () => {
    const subject = createSubject();
    subject.tokenService.verifyRefreshToken.mockRejectedValue({
      name: 'TokenExpiredError',
    });

    await expect(subject.service.refresh(refreshDto)).rejects.toMatchObject({
      response: expect.objectContaining({
        errorCode: AUTH_ERROR_CODES.refreshTokenExpired,
      }),
    });
  });

  it('rejects refresh token reuse when the stored hash no longer matches', async () => {
    const subject = createSubject();
    subject.tokenService.verifyRefreshToken.mockResolvedValue({
      sub: 'user-1',
      email: 'user@example.com',
    });
    subject.prismaClient.user.findUnique.mockResolvedValue(userRecord);
    subject.passwordService.compare.mockResolvedValue(false);

    await expect(subject.service.refresh(refreshDto)).rejects.toMatchObject({
      response: expect.objectContaining({
        errorCode: AUTH_ERROR_CODES.refreshTokenInvalid,
      }),
    });
  });
});
