import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { trimString, ToTrimmedString } from '@org/common';
import { AtLeastOneField } from './at-least-one-field.decorator';

function normalizeUppercase(value: unknown): unknown {
  const trimmedValue = trimString(value);
  return typeof trimmedValue === 'string'
    ? trimmedValue.toUpperCase()
    : trimmedValue;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => normalizeUppercase(value))
  sku?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ToTrimmedString()
  name?: string;

  @IsOptional()
  @IsString()
  @ToTrimmedString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  priceAmount?: number;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  @Transform(({ value }) => normalizeUppercase(value))
  currency?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  inventoryCount?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @AtLeastOneField(
    ['sku', 'name', 'description', 'priceAmount', 'currency', 'inventoryCount', 'isActive'],
    {
      message:
        'At least one product field must be provided',
    },
  )
  readonly atLeastOneField?: string;
}
