import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  getHelloNew(): string {
    return 'Hello new!';
  }
}
