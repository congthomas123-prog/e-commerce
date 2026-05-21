import { Test } from '@nestjs/testing';
import { createSuccessResponse } from '@org/common';
import type { CreateProductDto } from './dto/create-product.dto';
import type { UpdateProductDto } from './dto/update-product.dto';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  const product = {
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

  it('wraps create, list, and detail responses in common success envelope', async () => {
    const productsService = {
      create: jest.fn().mockResolvedValue(product),
      findAll: jest.fn().mockResolvedValue([product]),
      findOne: jest.fn().mockResolvedValue(product),
      update: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: productsService }],
    }).compile();

    const controller = moduleRef.get(ProductsController);
    const dto: CreateProductDto = {
      sku: 'SKU-001',
      name: 'Product Name',
      description: 'Product Description',
      priceAmount: 1299,
      currency: 'USD',
      inventoryCount: 10,
      isActive: true,
    };

    await expect(controller.create(dto)).resolves.toEqual(
      createSuccessResponse(product),
    );
    await expect(controller.findAll()).resolves.toEqual(
      createSuccessResponse([product]),
    );
    await expect(controller.findOne('product-1')).resolves.toEqual(
      createSuccessResponse(product),
    );
  });

  it('wraps patch responses in common success envelope', async () => {
    const productsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn().mockResolvedValue(product),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: productsService }],
    }).compile();

    const controller = moduleRef.get(ProductsController);
    const dto: UpdateProductDto = {
      inventoryCount: 5,
    };

    await expect(controller.update('product-1', dto)).resolves.toEqual(
      createSuccessResponse(product),
    );
    expect(productsService.update).toHaveBeenCalledWith('product-1', dto);
  });
});
