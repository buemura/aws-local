import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { Queue } from 'bullmq';
import { INestApplication } from '@nestjs/common';

const BULL_URL_PATH = '/bull-board';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  bullUiSetup(app);
  await app.listen(3000);
}

function bullUiSetup(app: INestApplication) {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath(BULL_URL_PATH);

  createBullBoard({
    serverAdapter,
    queues: [
      new BullAdapter(
        new Queue('products', {
          connection: {
            host: 'localhost',
            port: 6379,
          },
        }),
      ),
    ],
  });

  app.use(BULL_URL_PATH, serverAdapter.getRouter());
}

bootstrap();
