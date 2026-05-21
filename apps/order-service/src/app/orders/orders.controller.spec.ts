import { Test } from '@nestjs/testing';
import { createSuccessResponse } from '@org/common';
import type { CreateOrderDto } from './dto/create-order.dto';
import type { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

describe('OrdersController', () => {
  const order = {
    id: 'order-1',
    customerId: 'customer-1',
    status: 'DRAFT',
    currency: 'USD',
    totalAmount: 2598,
    items: [
      {
        id: 'item-1',
        productId: 'product-1',
        sku: 'SKU-001',
        name: 'Product Name',
        unitPriceAmount: 1299,
        quantity: 2,
        lineTotalAmount: 2598,
      },
    ],
    createdAt: new Date('2026-05-21T00:00:00.000Z'),
    updatedAt: new Date('2026-05-21T00:00:00.000Z'),
  };

  it('wraps create, list, and detail responses in common success envelope', async () => {
    const ordersService = {
      create: jest.fn().mockResolvedValue(order),
      findAll: jest.fn().mockResolvedValue([order]),
      findOne: jest.fn().mockResolvedValue(order),
      updateStatus: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrdersService, useValue: ordersService }],
    }).compile();

    const controller = moduleRef.get(OrdersController);
    const dto: CreateOrderDto = {
      customerId: 'customer-1',
      currency: 'USD',
      items: [
        {
          productId: 'product-1',
          sku: 'SKU-001',
          name: 'Product Name',
          unitPriceAmount: 1299,
          quantity: 2,
        },
      ],
    };

    await expect(controller.create(dto)).resolves.toEqual(
      createSuccessResponse(order),
    );
    await expect(controller.findAll()).resolves.toEqual(
      createSuccessResponse([order]),
    );
    await expect(controller.findOne('order-1')).resolves.toEqual(
      createSuccessResponse(order),
    );
  });

  it('wraps status patch responses in common success envelope', async () => {
    const ordersService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      updateStatus: jest.fn().mockResolvedValue({
        ...order,
        status: 'SUBMITTED',
      }),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrdersService, useValue: ordersService }],
    }).compile();

    const controller = moduleRef.get(OrdersController);
    const dto: UpdateOrderStatusDto = {
      status: 'SUBMITTED',
    };

    await expect(controller.updateStatus('order-1', dto)).resolves.toEqual(
      createSuccessResponse({
        ...order,
        status: 'SUBMITTED',
      }),
    );
    expect(ordersService.updateStatus).toHaveBeenCalledWith('order-1', dto);
  });
});
