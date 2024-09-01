import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import axios from 'axios';

type HttpConfig = {
  retries: number;
};

@Injectable()
export class HttpService {
  async get<T>(url: string, config?: HttpConfig): Promise<T> {
    let retries = config?.retries || 1;

    while (retries > 0) {
      console.log('HttpService GET:', { url, retries });
      retries--;

      try {
        const { data } = await axios.get<T>(url);
        return data;
      } catch (error) {
        if (error.status >= 400 && error.status < 500) {
          throw error;
        }

        if (error.status >= 500 && retries === 0) {
          throw new ServiceUnavailableException();
        }
      }
    }
  }

  async post<Input, Output>(
    url: string,
    body: Input,
    config?: HttpConfig,
  ): Promise<Output> {
    let retries = config?.retries || 1;

    while (retries > 0) {
      console.log('HttpService POST:', { url, body, retries });
      retries--;

      try {
        const { data } = await axios.post<Output>(url, body);
        return data;
      } catch (error) {
        if (error.status >= 400 && error.status < 500) {
          throw error;
        }

        if (error.status >= 500 && retries === 0) {
          throw new ServiceUnavailableException();
        }
      }
    }
  }
}
