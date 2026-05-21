import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { createSuccessResponse } from '@org/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@Controller('v1/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateProductDto) {
    return createSuccessResponse(await this.productsService.create(dto));
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return createSuccessResponse(await this.productsService.findAll());
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return createSuccessResponse(await this.productsService.findOne(id));
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return createSuccessResponse(await this.productsService.update(id, dto));
  }
}
