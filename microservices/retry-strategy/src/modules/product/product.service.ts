import { Injectable } from '@nestjs/common';
import { HttpService } from '../../common/http-requester/http.service';
import { ProductDto } from './dtos/product.dto';

@Injectable()
export class ProductService {
  private extServiceUrl: string = 'http://localhost:8080';

  constructor(private readonly httpService: HttpService) {}

  async getProducts(): Promise<ProductDto[]> {
    try {
      const data = await this.httpService.get<ProductDto[]>(
        this.extServiceUrl,
        {
          retries: 3,
          retryDelay: 1000,
        },
      );

      return data;
    } catch (error) {
      throw error;
    }
  }

  async createProduct(input: ProductDto): Promise<void> {
    try {
      await this.httpService.post<ProductDto, void>(this.extServiceUrl, input, {
        retries: 3,
        retryDelay: 1000,
      });
    } catch (error) {
      throw error;
    }
  }
}
