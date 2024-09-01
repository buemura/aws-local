import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import axios, { AxiosError } from 'axios';

type HttpConfig = {
  retries?: number;
  retryDelay?: number;
};

@Injectable()
export class HttpService {
  async get<T>(url: string, config?: HttpConfig): Promise<T> {
    return this.requestWithRetry<T>(() => axios.get<T>(url), url, config);
  }

  async post<Input, Output>(
    url: string,
    data: Input,
    config?: HttpConfig,
  ): Promise<Output> {
    return this.requestWithRetry<Output>(
      () => axios.post<Output>(url, data),
      url,
      config,
    );
  }

  private async requestWithRetry<T>(
    requestFn: () => Promise<{ data: T }>,
    url: string,
    config?: HttpConfig,
  ): Promise<T> {
    const retries = config?.retries ?? 1;
    const retryDelay = config?.retryDelay ?? 0;

    for (let attempt = 1; attempt <= retries; attempt++) {
      console.log('HttpService Request:', { url, attempt });

      try {
        const response = await requestFn();
        return response.data;
      } catch (error) {
        const axiosError = error as AxiosError;

        if (
          axiosError.response &&
          axiosError.response.status >= 400 &&
          axiosError.response.status < 500
        ) {
          console.error('Client error, not retrying:', axiosError.message);
          throw axiosError;
        }

        if (attempt === retries) {
          console.error(
            'Maximum retries reached, service unavailable:',
            axiosError.message,
          );
          throw new ServiceUnavailableException(axiosError.message);
        }

        if (retryDelay > 0) {
          await this.delay(retryDelay);
        }
      }
    }

    throw new Error(
      'Unexpected error: exceeded retries without catching or returning.',
    );
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
