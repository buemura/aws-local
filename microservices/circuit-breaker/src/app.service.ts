import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class AppService {
  constructor(private httpService: HttpService) {}

  async getData() {
    console.log(`getData called at ${new Date()}`);

    const response = this.httpService.get('http://localhost:8080');

    return firstValueFrom(
      response.pipe(
        map((res) => res.data),
        catchError((err) => {
          throw new Error('Failed to fetch data from the service');
        }),
      ),
    );
  }
}
