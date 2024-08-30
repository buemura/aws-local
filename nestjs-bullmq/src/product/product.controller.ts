import { InjectQueue } from '@nestjs/bullmq';
import {
  Controller,
  Param,
  ParseIntPipe,
  Post,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Queue } from 'bullmq';

@Controller('product')
export class ProductController {
  constructor(@InjectQueue('product') private productQueue: Queue) {}

  @Post(':id')
  async requestProductList(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    const jobId = `product-list-${id}`;
    const jobs = await this.productQueue.getCompleted();
    const jobCompleted = jobs.find((j) => j.id === jobId);

    if (jobCompleted) {
      if (new Date() < new Date(jobCompleted.finishedOn + 120000)) {
        throw new UnprocessableEntityException('Cannot execute job');
      }
      jobCompleted.remove();
    }

    console.log(`Requesting product list for ID: ${id}`);
    await this.productQueue.add(
      `product-list`,
      { id },
      {
        jobId: `product-list-${id}`,
        delay: 1,
        removeOnComplete: {
          age: 30,
          count: 5,
        },
      },
    );
    console.log(`Created Job product list for ID: ${id}`);
  }
}
