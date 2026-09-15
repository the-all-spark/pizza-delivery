import { Injectable } from '@nestjs/common';

@Injectable()
export class OrdersService {
  getHello(): string {
    return 'Hello from OrdersService!';
  }
}
