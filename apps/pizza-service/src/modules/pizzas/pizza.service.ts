import { Injectable } from '@nestjs/common';

@Injectable()
export class PizzaService {
  getHello(): string {
    return 'Hello from PizzaService!';
  }
}
