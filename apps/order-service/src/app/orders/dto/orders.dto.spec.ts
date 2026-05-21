import { createValidationPipe } from '@org/common';
import { CreateOrderDto } from './create-order.dto';
import { UpdateOrderStatusDto } from './update-order-status.dto';

describe('Orders DTOs', () => {
  const pipe = createValidationPipe();

  it('normalizes currency and item sku fields for create input', async () => {
    await expect(
      pipe.transform(
        {
          customerId: '  customer-1  ',
          currency: '  usd  ',
          items: [
            {
              productId: 'product-1',
              sku: '  sku-001  ',
              name: '  Product Name  ',
              unitPriceAmount: 1299,
              quantity: 2,
            },
          ],
        },
        {
          type: 'body',
          metatype: CreateOrderDto,
        },
      ),
    ).resolves.toEqual({
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
    });
  });

  it('rejects invalid create payloads', async () => {
    await expect(
      pipe.transform(
        {
          customerId: '   ',
          currency: 'us',
          items: [
            {
              productId: '   ',
              sku: '   ',
              name: '   ',
              unitPriceAmount: -1,
              quantity: 0,
            },
          ],
        },
        {
          type: 'body',
          metatype: CreateOrderDto,
        },
      ),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        message: expect.arrayContaining([
          'customerId should not be empty',
          'currency must be longer than or equal to 3 characters',
          'items.0.productId should not be empty',
          'items.0.sku should not be empty',
          'items.0.name should not be empty',
          'items.0.unitPriceAmount must not be less than 0',
          'items.0.quantity must not be less than 1',
        ]),
      }),
    });
  });

  it('rejects empty item arrays', async () => {
    await expect(
      pipe.transform(
        {
          customerId: 'customer-1',
          currency: 'USD',
          items: [],
        },
        {
          type: 'body',
          metatype: CreateOrderDto,
        },
      ),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        message: expect.arrayContaining([
          'items must contain at least 1 elements',
        ]),
      }),
    });
  });

  it('accepts valid status patch payloads', async () => {
    await expect(
      pipe.transform(
        { status: 'SUBMITTED' },
        {
          type: 'body',
          metatype: UpdateOrderStatusDto,
        },
      ),
    ).resolves.toEqual({ status: 'SUBMITTED' });
  });

  it('rejects missing or invalid status patch payloads', async () => {
    await expect(
      pipe.transform(
        {},
        {
          type: 'body',
          metatype: UpdateOrderStatusDto,
        },
      ),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        message: expect.arrayContaining([
          'status should not be empty',
          'status must be one of the following values: SUBMITTED, CANCELLED',
        ]),
      }),
    });
  });
});
