import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { trimString, ToTrimmedString } from '@org/common';
import { AtLeastOneField } from './at-least-one-field.decorator';

function normalizeEmail(value: unknown): unknown {
  const trimmedValue = trimString(value);
  return typeof trimmedValue === 'string'
    ? trimmedValue.toLowerCase()
    : trimmedValue;
}

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => normalizeEmail(value))
  email?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ToTrimmedString()
  fullName?: string;

  @AtLeastOneField(['email', 'fullName'], {
    message: 'At least one of email or fullName must be provided',
  })
  readonly atLeastOneField?: string;
}
