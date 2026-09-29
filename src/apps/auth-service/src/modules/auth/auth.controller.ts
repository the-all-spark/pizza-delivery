// * Контроллер авторизации микросервиса auth-service

import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';

import type { RegisterPayload } from '../auth/interfaces/register-payload.interface';
import type { LoginPayload } from '../auth/interfaces/login-payload.interface';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // * Обработчик команды регистрации нового пользователя
  @MessagePattern('user_register')
  async register(@Payload() data: RegisterPayload) {
    return await this.authService.register(data);
  }

  // * Обработчик команды входа в систему (авторизации)
  @MessagePattern('user_login')
  async login(@Payload() data: LoginPayload) {
    return await this.authService.login(data);
  }
}
