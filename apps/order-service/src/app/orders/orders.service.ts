import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@org/database';
import { randomUUID } from 'node:crypto';
import type { Order, OrderItem, PrismaClient } from '../../generated/prisma';
import { ORDER_ERROR_CODES } from './constants/order-error-codes.constants';
import type { CreateOrderDto } from './dto/create-order.dto';
import type { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import type {
  OrderItemResponse,
  OrderResponse,
  OrderStatusValue,
} from './types/order.types';

type OrderWithItems = Order & { items: OrderItem[] };

@Injectable()
export class OrdersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: CreateOrderDto): Promise<OrderResponse> {
    const currency = this.normalizeUppercase(dto.currency);
    const items = dto.items.map((item) => {
      const lineTotalAmount = item.unitPriceAmount * item.quantity;

      return {
        id: randomUUID(),
        productId: item.productId,
        sku: this.normalizeUppercase(item.sku),
        name: item.name,
        unitPriceAmount: item.unitPriceAmount,
        quantity: item.quantity,
        lineTotalAmount,
      };
    });
    const totalAmount = items.reduce(
      (sum, item) => sum + item.lineTotalAmount,
      0,
    );

    const createdOrder = await this.prisma.order.create({
      data: {
        id: randomUUID(),
        customerId: dto.customerId,
        currency,
        totalAmount,
        status: 'DRAFT',
        items: {
          create: items,
        },
      },
      include: { items: true },
    });

    return this.toOrderResponse(createdOrder);
  }

  async findAll(): Promise<OrderResponse[]> {
    const orders = await this.prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order) => this.toOrderResponse(order));
  }

  async findOne(id: string): Promise<OrderResponse> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      throw this.createOrderNotFoundException();
    }

    return this.toOrderResponse(order);
  }

  async updateStatus(
    id: string,
    dto: UpdateOrderStatusDto,
  ): Promise<OrderResponse> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      throw this.createOrderNotFoundException();
    }

    if (order.status !== 'DRAFT') {
      throw this.createInvalidStatusTransitionException();
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: { status: dto.status },
      include: { items: true },
    });

    return this.toOrderResponse(updatedOrder);
  }

  private createInvalidStatusTransitionException(): ConflictException {
    return new ConflictException({
      message: 'Invalid order status transition.',
      errorCode: ORDER_ERROR_CODES.invalidStatusTransition,
    });
  }

  private createOrderNotFoundException(): NotFoundException {
    return new NotFoundException({
      message: 'Order not found.',
      errorCode: ORDER_ERROR_CODES.orderNotFound,
    });
  }

  private normalizeUppercase(value: string): string {
    return value.trim().toUpperCase();
  }

  private toOrderItemResponse(item: OrderItem): OrderItemResponse {
    return {
      id: item.id,
      productId: item.productId,
      sku: item.sku,
      name: item.name,
      unitPriceAmount: item.unitPriceAmount,
      quantity: item.quantity,
      lineTotalAmount: item.lineTotalAmount,
    };
  }

  private toOrderResponse(order: OrderWithItems): OrderResponse {
    return {
      id: order.id,
      customerId: order.customerId,
      status: order.status as OrderStatusValue,
      currency: order.currency,
      totalAmount: order.totalAmount,
      items: order.items.map((item) => this.toOrderItemResponse(item)),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  private get prisma(): PrismaClient {
    return this.prismaService.instance as PrismaClient;
  }
}
