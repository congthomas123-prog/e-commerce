import { ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@org/database';
import { ORDER_ERROR_CODES } from './constants/order-error-codes.constants';
import type { CreateOrderDto } from './dto/create-order.dto';
import type { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  const createOrderDto: CreateOrderDto = {
    customerId: 'customer-1',
    currency: 'usd',
    items: [
      {
        productId: 'product-1',
        sku: 'sku-001',
        name: 'Product Name',
        unitPriceAmount: 1299,
        quantity: 2,
      },
    ],
  };

  const updateStatusDto: UpdateOrderStatusDto = {
    status: 'SUBMITTED',
  };

  const draftOrder = {
    id: 'order-1',
    customerId: 'customer-1',
    status: 'DRAFT',
    currency: 'USD',
    totalAmount: 2598,
    createdAt: new Date('2026-05-21T00:00:00.000Z'),
    updatedAt: new Date('2026-05-21T00:00:00.000Z'),
    items: [
      {
        id: 'item-1',
        orderId: 'order-1',
        productId: 'product-1',
        sku: 'SKU-001',
        name: 'Product Name',
        unitPriceAmount: 1299,
        quantity: 2,
        lineTotalAmount: 2598,
      },
    ],
  };

  const expectedOrderResponse = {
    id: 'order-1',
    customerId: 'customer-1',
    status: 'DRAFT',
    currency: 'USD',
    totalAmount: 2598,
    createdAt: new Date('2026-05-21T00:00:00.000Z'),
    updatedAt: new Date('2026-05-21T00:00:00.000Z'),
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
  };

  function createSubject() {
    const prismaClient = {
      order: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const prismaService = {
      instance: prismaClient,
    } as unknown as PrismaService;

    return {
      prismaClient,
      service: new OrdersService(prismaService),
    };
  }

  it('creates draft order, snapshots items, and computes totals', async () => {
    const subject = createSubject();
    subject.prismaClient.order.create.mockResolvedValue(draftOrder);

    await expect(subject.service.create(createOrderDto)).resolves.toEqual(
      expectedOrderResponse,
    );
    expect(subject.prismaClient.order.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        customerId: 'customer-1',
        currency: 'USD',
        totalAmount: 2598,
        status: 'DRAFT',
        items: {
          create: expect.arrayContaining([
            expect.objectContaining({
              productId: 'product-1',
              sku: 'SKU-001',
              name: 'Product Name',
              unitPriceAmount: 1299,
              quantity: 2,
              lineTotalAmount: 2598,
            }),
          ]),
        },
      }),
      include: { items: true },
    });
  });

  it('lists orders with items ordered by createdAt desc', async () => {
    const subject = createSubject();
    subject.prismaClient.order.findMany.mockResolvedValue([draftOrder]);

    await expect(subject.service.findAll()).resolves.toEqual([
      expectedOrderResponse,
    ]);
    expect(subject.prismaClient.order.findMany).toHaveBeenCalledWith({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('returns order with items by id', async () => {
    const subject = createSubject();
    subject.prismaClient.order.findUnique.mockResolvedValue(draftOrder);

    await expect(subject.service.findOne('order-1')).resolves.toEqual(
      expectedOrderResponse,
    );
  });

  it('rejects missing order detail lookups', async () => {
    const subject = createSubject();
    subject.prismaClient.order.findUnique.mockResolvedValue(null);
    const result = subject.service.findOne('missing-order');

    await expect(result).rejects.toBeInstanceOf(NotFoundException);
    await expect(result).rejects.toMatchObject({
      response: expect.objectContaining({
        errorCode: ORDER_ERROR_CODES.orderNotFound,
      }),
    });
  });

  it('transitions DRAFT to SUBMITTED', async () => {
    const subject = createSubject();
    subject.prismaClient.order.findUnique.mockResolvedValue(draftOrder);
    subject.prismaClient.order.update.mockResolvedValue({
      ...draftOrder,
      status: 'SUBMITTED',
    });

    await expect(subject.service.updateStatus('order-1', updateStatusDto)).resolves.toEqual({
      ...expectedOrderResponse,
      status: 'SUBMITTED',
    });
    expect(subject.prismaClient.order.update).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      data: { status: 'SUBMITTED' },
      include: { items: true },
    });
  });

  it('transitions DRAFT to CANCELLED', async () => {
    const subject = createSubject();
    subject.prismaClient.order.findUnique.mockResolvedValue(draftOrder);
    subject.prismaClient.order.update.mockResolvedValue({
      ...draftOrder,
      status: 'CANCELLED',
    });

    await expect(
      subject.service.updateStatus('order-1', { status: 'CANCELLED' }),
    ).resolves.toEqual({
      ...expectedOrderResponse,
      status: 'CANCELLED',
    });
  });

  it('rejects invalid status transitions', async () => {
    const subject = createSubject();
    subject.prismaClient.order.findUnique.mockResolvedValue({
      ...draftOrder,
      status: 'SUBMITTED',
    });
    const result = subject.service.updateStatus('order-1', {
      status: 'CANCELLED',
    });

    await expect(result).rejects.toBeInstanceOf(ConflictException);
    await expect(result).rejects.toMatchObject({
      response: expect.objectContaining({
        errorCode: ORDER_ERROR_CODES.invalidStatusTransition,
      }),
    });
  });

  it('rejects missing orders during status patch', async () => {
    const subject = createSubject();
    subject.prismaClient.order.findUnique.mockResolvedValue(null);
    const result = subject.service.updateStatus('missing-order', updateStatusDto);

    await expect(result).rejects.toBeInstanceOf(NotFoundException);
    await expect(result).rejects.toMatchObject({
      response: expect.objectContaining({
        errorCode: ORDER_ERROR_CODES.orderNotFound,
      }),
    });
  });
});
