import { Injectable } from '@nestjs/common';

@Injectable()
export class LoggerServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
