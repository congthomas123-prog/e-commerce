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

function normalizeUppercase(value: unknown): unknown {
  const trimmedValue = trimString(value);
  return typeof trimmedValue === 'string'
    ? trimmedValue.toUpperCase()
    : trimmedValue;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => normalizeUppercase(value))
  sku!: string;

  @IsString()
  @IsNotEmpty()
  @ToTrimmedString()
  name!: string;

  @IsOptional()
  @IsString()
  @ToTrimmedString()
  description?: string;

  @IsInt()
  @Min(0)
  priceAmount!: number;

  @IsString()
  @Length(3, 3)
  @Transform(({ value }) => normalizeUppercase(value))
  currency!: string;

  @IsInt()
  @Min(0)
  inventoryCount!: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
