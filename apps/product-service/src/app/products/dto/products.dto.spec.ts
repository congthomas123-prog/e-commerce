import { createValidationPipe } from '@org/common';
import { CreateProductDto } from './create-product.dto';
import { UpdateProductDto } from './update-product.dto';

describe('Products DTOs', () => {
  const pipe = createValidationPipe();

  it('normalizes sku and currency and trims strings for create input', async () => {
    await expect(
      pipe.transform(
        {
          sku: '  sku-001  ',
          name: '  Product Name  ',
          description: '  Product Description  ',
          priceAmount: 1299,
          currency: '  usd  ',
          inventoryCount: 10,
        },
        {
          type: 'body',
          metatype: CreateProductDto,
        },
      ),
    ).resolves.toEqual({
      sku: 'SKU-001',
      name: 'Product Name',
      description: 'Product Description',
      priceAmount: 1299,
      currency: 'USD',
      inventoryCount: 10,
    });
  });

  it('rejects invalid create payloads', async () => {
    await expect(
      pipe.transform(
        {
          sku: '   ',
          name: '   ',
          priceAmount: -1,
          currency: 'us',
          inventoryCount: -1,
        },
        {
          type: 'body',
          metatype: CreateProductDto,
        },
      ),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        message: expect.arrayContaining([
          'sku should not be empty',
          'name should not be empty',
          'priceAmount must not be less than 0',
          'currency must be longer than or equal to 3 characters',
          'inventoryCount must not be less than 0',
        ]),
      }),
    });
  });

  it('normalizes patch sku and currency input', async () => {
    await expect(
      pipe.transform(
        {
          sku: '  sku-001  ',
          currency: '  usd  ',
        },
        {
          type: 'body',
          metatype: UpdateProductDto,
        },
      ),
    ).resolves.toEqual({
      sku: 'SKU-001',
      currency: 'USD',
    });
  });

  it('rejects empty patch payloads', async () => {
    await expect(
      pipe.transform(
        {},
        {
          type: 'body',
          metatype: UpdateProductDto,
        },
      ),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        message: expect.arrayContaining([
          'At least one product field must be provided',
        ]),
      }),
    });
  });
});
