import { IsNotEmpty, IsString } from 'class-validator';
import { ToTrimmedString } from '@org/common';

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  @ToTrimmedString()
  refreshToken!: string;
}
