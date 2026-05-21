import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import type { OrderStatusValue } from '../types/order.types';

export class UpdateOrderStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['SUBMITTED', 'CANCELLED'])
  status!: Extract<OrderStatusValue, 'SUBMITTED' | 'CANCELLED'>;
}
