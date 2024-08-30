import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('product')
export class ProductEventListener extends WorkerHost {
  async process(job: Job): Promise<any> {
    console.log(job.name);
  }
}
