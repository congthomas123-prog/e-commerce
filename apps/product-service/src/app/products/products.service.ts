import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@org/database';
import { randomUUID } from 'node:crypto';
import type { PrismaClient, Product } from '../../generated/prisma';
import { PRODUCT_ERROR_CODES } from './constants/product-error-codes.constants';
import type { CreateProductDto } from './dto/create-product.dto';
import type { UpdateProductDto } from './dto/update-product.dto';
import type { ProductResponse } from './types/product.types';

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: CreateProductDto): Promise<ProductResponse> {
    const sku = this.normalizeUppercase(dto.sku);
    const currency = this.normalizeUppercase(dto.currency);
    const existingProduct = await this.prisma.product.findUnique({
      where: { sku },
    });

    if (existingProduct) {
      throw this.createSkuAlreadyExistsException();
    }

    const createdProduct = await this.prisma.product.create({
      data: {
        id: randomUUID(),
        sku,
        name: dto.name,
        description: dto.description ?? null,
        priceAmount: dto.priceAmount,
        currency,
        inventoryCount: dto.inventoryCount,
        isActive: dto.isActive ?? true,
      },
    });

    return this.toProductResponse(createdProduct);
  }

  async findAll(): Promise<ProductResponse[]> {
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return products.map((product) => this.toProductResponse(product));
  }

  async findOne(id: string): Promise<ProductResponse> {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        isActive: true,
      },
    });

    if (!product) {
      throw this.createProductNotFoundException();
    }

    return this.toProductResponse(product);
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductResponse> {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw this.createProductNotFoundException();
    }

    const sku = dto.sku ? this.normalizeUppercase(dto.sku) : undefined;
    const currency = dto.currency
      ? this.normalizeUppercase(dto.currency)
      : undefined;

    if (sku && sku !== existingProduct.sku) {
      const duplicateProduct = await this.prisma.product.findUnique({
        where: { sku },
      });

      if (duplicateProduct) {
        throw this.createSkuAlreadyExistsException();
      }
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: {
        ...(sku ? { sku } : {}),
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.priceAmount !== undefined
          ? { priceAmount: dto.priceAmount }
          : {}),
        ...(currency ? { currency } : {}),
        ...(dto.inventoryCount !== undefined
          ? { inventoryCount: dto.inventoryCount }
          : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });

    return this.toProductResponse(updatedProduct);
  }

  private createProductNotFoundException(): NotFoundException {
    return new NotFoundException({
      message: 'Product not found.',
      errorCode: PRODUCT_ERROR_CODES.productNotFound,
    });
  }

  private createSkuAlreadyExistsException(): ConflictException {
    return new ConflictException({
      message: 'SKU already exists.',
      errorCode: PRODUCT_ERROR_CODES.skuAlreadyExists,
    });
  }

  private normalizeUppercase(value: string): string {
    return value.trim().toUpperCase();
  }

  private toProductResponse(product: Product): ProductResponse {
    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      description: product.description,
      priceAmount: product.priceAmount,
      currency: product.currency,
      inventoryCount: product.inventoryCount,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  private get prisma(): PrismaClient {
    return this.prismaService.instance as PrismaClient;
  }
}
