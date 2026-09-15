import { Injectable } from '@nestjs/common';

@Injectable()
export class PromoCodeService {
  getHello(): string {
    return 'Hello from PromoCodeService!';
  }
}
