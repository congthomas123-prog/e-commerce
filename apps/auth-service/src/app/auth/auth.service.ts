import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { PrismaClient } from '@prisma/client';
import { PrismaService } from '@org/database';
import { randomUUID } from 'node:crypto';
import { AUTH_ERROR_CODES } from './constants/auth-error-codes.constants';
import type { LoginDto } from './dto/login.dto';
import type { RefreshTokenDto } from './dto/refresh-token.dto';
import type { RegisterDto } from './dto/register.dto';
import { AuthTokenService } from './services/auth-token.service';
import { PasswordService } from './services/password.service';
import type {
  AuthResponseData,
  AuthenticatedUser,
} from './types/auth-response.types';

type UserRecord = {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string;
  refreshTokenHash: string | null;
};

type TokenSubject = {
  id: string;
  email: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly tokenService: AuthTokenService,
    private readonly passwordService: PasswordService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseData> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException({
        message: 'Email already exists.',
        errorCode: AUTH_ERROR_CODES.emailAlreadyExists,
      });
    }

    const userId = randomUUID();
    const passwordHash = await this.passwordService.hash(dto.password);
    const tokens = await this.tokenService.issueTokens({
      id: userId,
      email: dto.email,
    });
    const refreshTokenHash = await this.passwordService.hash(
      tokens.refreshToken,
    );

    const createdUser = await this.prisma.user.create({
      data: {
        id: userId,
        email: dto.email,
        fullName: dto.fullName,
        passwordHash,
        refreshTokenHash,
      },
    });

    return this.createAuthResponse(createdUser, tokens);
  }

  async login(dto: LoginDto): Promise<AuthResponseData> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw this.createInvalidCredentialsException();
    }

    const passwordMatches = await this.passwordService.compare(
      dto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw this.createInvalidCredentialsException();
    }

    const tokens = await this.tokenService.issueTokens(this.toTokenSubject(user));
    const refreshTokenHash = await this.passwordService.hash(tokens.refreshToken);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash },
    });

    return this.createAuthResponse(user, tokens);
  }

  async refresh(dto: RefreshTokenDto): Promise<AuthResponseData> {
    const payload = await this.verifyRefreshTokenOrThrow(dto.refreshToken);
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user?.refreshTokenHash) {
      throw this.createInvalidRefreshTokenException();
    }

    const refreshTokenMatches = await this.passwordService.compare(
      dto.refreshToken,
      user.refreshTokenHash,
    );

    if (!refreshTokenMatches) {
      throw this.createInvalidRefreshTokenException();
    }

    const tokens = await this.tokenService.issueTokens(this.toTokenSubject(user));
    const refreshTokenHash = await this.passwordService.hash(tokens.refreshToken);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash },
    });

    return this.createAuthResponse(user, tokens);
  }

  private async verifyRefreshTokenOrThrow(refreshToken: string) {
    try {
      return await this.tokenService.verifyRefreshToken(refreshToken);
    } catch (error) {
      const errorName =
        typeof error === 'object' && error !== null && 'name' in error
          ? String(error.name)
          : '';

      if (errorName === 'TokenExpiredError') {
        throw new UnauthorizedException({
          message: 'Refresh token expired.',
          errorCode: AUTH_ERROR_CODES.refreshTokenExpired,
        });
      }

      throw this.createInvalidRefreshTokenException();
    }
  }

  private createAuthResponse(
    user: UserRecord,
    tokens: { accessToken: string; refreshToken: string },
  ): AuthResponseData {
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.toAuthenticatedUser(user),
    };
  }

  private createInvalidCredentialsException(): UnauthorizedException {
    return new UnauthorizedException({
      message: 'Invalid credentials.',
      errorCode: AUTH_ERROR_CODES.invalidCredentials,
    });
  }

  private createInvalidRefreshTokenException(): UnauthorizedException {
    return new UnauthorizedException({
      message: 'Invalid refresh token.',
      errorCode: AUTH_ERROR_CODES.refreshTokenInvalid,
    });
  }

  private toAuthenticatedUser(user: UserRecord): AuthenticatedUser {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
    };
  }

  private toTokenSubject(user: TokenSubject): TokenSubject {
    return {
      id: user.id,
      email: user.email,
    };
  }

  private get prisma(): PrismaClient {
    return this.prismaService.instance as PrismaClient;
  }
}
