import { Body, Controller, Get, Post } from '@nestjs/common';

import { ProductService } from './product.service';
import { ProductDto } from './dtos/product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async getProducts(): Promise<ProductDto[]> {
    return this.productService.getProducts();
  }

  @Post()
  async createProduct(@Body() input: ProductDto): Promise<void> {
    await this.productService.createProduct(input);
  }
}
