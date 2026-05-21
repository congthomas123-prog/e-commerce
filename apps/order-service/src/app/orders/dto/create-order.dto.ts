import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';
import { trimString, ToTrimmedString } from '@org/common';

function normalizeUppercase(value: unknown): unknown {
  const trimmedValue = trimString(value);
  return typeof trimmedValue === 'string'
    ? trimmedValue.toUpperCase()
    : trimmedValue;
}

export class CreateOrderItemDto {
  @IsString()
  @IsNotEmpty()
  @ToTrimmedString()
  productId!: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => normalizeUppercase(value))
  sku!: string;

  @IsString()
  @IsNotEmpty()
  @ToTrimmedString()
  name!: string;

  @IsInt()
  @Min(0)
  unitPriceAmount!: number;

  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  @ToTrimmedString()
  customerId!: string;

  @IsString()
  @Length(3, 3)
  @Transform(({ value }) => normalizeUppercase(value))
  currency!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
