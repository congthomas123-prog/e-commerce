import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compare, hash } from 'bcryptjs';

@Injectable()
export class PasswordService {
  constructor(private readonly configService: ConfigService) {}

  hash(value: string): Promise<string> {
    return hash(value, this.getBcryptRounds());
  }

  compare(value: string, hashedValue: string): Promise<boolean> {
    return compare(value, hashedValue);
  }

  private getBcryptRounds(): number {
    const rawValue = this.configService.get<string>('BCRYPT_ROUNDS')?.trim();
    const parsedValue = Number.parseInt(rawValue ?? '12', 10);

    return Number.isNaN(parsedValue) ? 12 : parsedValue;
  }
}
