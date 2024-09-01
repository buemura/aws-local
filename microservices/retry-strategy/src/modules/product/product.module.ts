import { Module } from '@nestjs/common';

import { HttpModule } from '@/common/http-requester/http.module';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  imports: [HttpModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
