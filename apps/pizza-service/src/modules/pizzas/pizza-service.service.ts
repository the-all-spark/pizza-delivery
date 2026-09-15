import { Injectable } from '@nestjs/common';

@Injectable()
export class PizzaServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
