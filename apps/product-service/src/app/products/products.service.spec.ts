import { ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@org/database';
import { PRODUCT_ERROR_CODES } from './constants/product-error-codes.constants';
import type { CreateProductDto } from './dto/create-product.dto';
import type { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  const createProductDto: CreateProductDto = {
    sku: 'sku-001',
    name: 'Product Name',
    description: 'Product Description',
    priceAmount: 1299,
    currency: 'usd',
    inventoryCount: 10,
    isActive: true,
  };

  const updateProductDto: UpdateProductDto = {
    sku: 'sku-002',
    name: 'Updated Name',
    description: 'Updated Description',
    priceAmount: 1499,
    currency: 'eur',
    inventoryCount: 4,
    isActive: false,
  };

  const activeProduct = {
    id: 'product-1',
    sku: 'SKU-001',
    name: 'Product Name',
    description: 'Product Description',
    priceAmount: 1299,
    currency: 'USD',
    inventoryCount: 10,
    isActive: true,
    createdAt: new Date('2026-05-21T00:00:00.000Z'),
    updatedAt: new Date('2026-05-21T00:00:00.000Z'),
  };

  function createSubject() {
    const prismaClient = {
      product: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const prismaService = {
      instance: prismaClient,
    } as unknown as PrismaService;

    return {
      prismaClient,
      service: new ProductsService(prismaService),
    };
  }

  it('creates product, normalizes values, and returns stored record', async () => {
    const subject = createSubject();
    subject.prismaClient.product.findUnique.mockResolvedValue(null);
    subject.prismaClient.product.create.mockResolvedValue(activeProduct);

    await expect(subject.service.create(createProductDto)).resolves.toEqual(
      activeProduct,
    );
    expect(subject.prismaClient.product.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        sku: 'SKU-001',
        currency: 'USD',
        name: 'Product Name',
        description: 'Product Description',
        priceAmount: 1299,
        inventoryCount: 10,
        isActive: true,
      }),
    });
  });

  it('rejects duplicate sku during create', async () => {
    const subject = createSubject();
    subject.prismaClient.product.findUnique.mockResolvedValue(activeProduct);
    const result = subject.service.create(createProductDto);

    await expect(result).rejects.toBeInstanceOf(ConflictException);
    await expect(result).rejects.toMatchObject({
      response: expect.objectContaining({
        errorCode: PRODUCT_ERROR_CODES.skuAlreadyExists,
      }),
    });
  });

  it('lists active products ordered by createdAt desc', async () => {
    const subject = createSubject();
    subject.prismaClient.product.findMany.mockResolvedValue([activeProduct]);

    await expect(subject.service.findAll()).resolves.toEqual([activeProduct]);
    expect(subject.prismaClient.product.findMany).toHaveBeenCalledWith({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('returns active product by id', async () => {
    const subject = createSubject();
    subject.prismaClient.product.findFirst.mockResolvedValue(activeProduct);

    await expect(subject.service.findOne('product-1')).resolves.toEqual(
      activeProduct,
    );
  });

  it('rejects missing or inactive product during detail read', async () => {
    const subject = createSubject();
    subject.prismaClient.product.findFirst.mockResolvedValue(null);
    const result = subject.service.findOne('missing-product');

    await expect(result).rejects.toBeInstanceOf(NotFoundException);
    await expect(result).rejects.toMatchObject({
      response: expect.objectContaining({
        errorCode: PRODUCT_ERROR_CODES.productNotFound,
      }),
    });
  });

  it('updates mutable product fields', async () => {
    const subject = createSubject();
    subject.prismaClient.product.findUnique
      .mockResolvedValueOnce(activeProduct)
      .mockResolvedValueOnce(null);
    subject.prismaClient.product.update.mockResolvedValue({
      ...activeProduct,
      sku: 'SKU-002',
      name: 'Updated Name',
      description: 'Updated Description',
      priceAmount: 1499,
      currency: 'EUR',
      inventoryCount: 4,
      isActive: false,
      updatedAt: new Date('2026-05-21T01:00:00.000Z'),
    });

    await expect(subject.service.update('product-1', updateProductDto)).resolves.toEqual({
      ...activeProduct,
      sku: 'SKU-002',
      name: 'Updated Name',
      description: 'Updated Description',
      priceAmount: 1499,
      currency: 'EUR',
      inventoryCount: 4,
      isActive: false,
      updatedAt: new Date('2026-05-21T01:00:00.000Z'),
    });
    expect(subject.prismaClient.product.update).toHaveBeenCalledWith({
      where: { id: 'product-1' },
      data: {
        sku: 'SKU-002',
        name: 'Updated Name',
        description: 'Updated Description',
        priceAmount: 1499,
        currency: 'EUR',
        inventoryCount: 4,
        isActive: false,
      },
    });
  });

  it('rejects duplicate sku during update', async () => {
    const subject = createSubject();
    subject.prismaClient.product.findUnique
      .mockResolvedValueOnce(activeProduct)
      .mockResolvedValueOnce({ ...activeProduct, id: 'product-2', sku: 'SKU-002' });
    const result = subject.service.update('product-1', updateProductDto);

    await expect(result).rejects.toBeInstanceOf(ConflictException);
    await expect(result).rejects.toMatchObject({
      response: expect.objectContaining({
        errorCode: PRODUCT_ERROR_CODES.skuAlreadyExists,
      }),
    });
  });

  it('rejects missing product during update', async () => {
    const subject = createSubject();
    subject.prismaClient.product.findUnique.mockResolvedValue(null);
    const result = subject.service.update('missing-product', updateProductDto);

    await expect(result).rejects.toBeInstanceOf(NotFoundException);
    await expect(result).rejects.toMatchObject({
      response: expect.objectContaining({
        errorCode: PRODUCT_ERROR_CODES.productNotFound,
      }),
    });
  });
});
