import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { BullModule } from '@nestjs/bullmq';
import { ProductEventListener } from './product.event-listener';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueueAsync({
      name: 'product',
    }),
  ],
  controllers: [ProductController],
  providers: [ProductEventListener],
})
export class ProductModule {}
