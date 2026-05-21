import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import type {
  AuthTokens,
  RefreshTokenPayload,
} from '../types/auth-response.types';

type TokenSubject = {
  id: string;
  email: string;
};

@Injectable()
export class AuthTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async issueTokens(subject: TokenSubject): Promise<AuthTokens> {
    const payload = {
      sub: subject.id,
      email: subject.email,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.getRequiredConfig('JWT_ACCESS_SECRET'),
        expiresIn: this.getDurationConfig('JWT_ACCESS_EXPIRES_IN', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.getRequiredConfig('JWT_REFRESH_SECRET'),
        expiresIn: this.getDurationConfig('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  verifyRefreshToken(refreshToken: string): Promise<RefreshTokenPayload> {
    return this.jwtService.verifyAsync<RefreshTokenPayload>(refreshToken, {
      secret: this.getRequiredConfig('JWT_REFRESH_SECRET'),
    });
  }

  private getRequiredConfig(key: string): string {
    const value = this.configService.get<string>(key)?.trim();

    if (!value) {
      throw new Error(`${key} environment variable is required.`);
    }

    return value;
  }

  private getDurationConfig(key: string, fallback: StringValue): StringValue {
    return (this.configService.get<string>(key)?.trim() || fallback) as StringValue;
  }
}
