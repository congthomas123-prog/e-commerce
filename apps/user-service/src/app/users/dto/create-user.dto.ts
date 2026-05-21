import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { trimString, ToTrimmedString } from '@org/common';

function normalizeEmail(value: unknown): unknown {
  const trimmedValue = trimString(value);
  return typeof trimmedValue === 'string'
    ? trimmedValue.toLowerCase()
    : trimmedValue;
}

export class CreateUserDto {
  @IsEmail()
  @Transform(({ value }) => normalizeEmail(value))
  email!: string;

  @IsString()
  @IsNotEmpty()
  @ToTrimmedString()
  fullName!: string;
}
