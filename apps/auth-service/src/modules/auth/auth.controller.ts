// * Контроллер авторизации микросервиса auth-service
// Работает исключительно через сообщения RabbitMQ

import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';

// Импортируем созданные ранее интерфейсы для типизации входящих сообщений
import type { RegisterPayload } from './interfaces/register-payload.interface';
import type { LoginPayload } from './interfaces/login-payload.interface';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // * Обработчик команды регистрации нового пользователя
  // Слушает строку 'user_register', которую отправляет api-gateway
  @MessagePattern('user_register')
  async register(@Payload() data: RegisterPayload) {
    // Декоратор @Payload() автоматически извлекает тело сообщения (body) из RabbitMQ
    return await this.authService.register(data);
  }

  // * Обработчик команды входа в систему (авторизации)
  // Слушает строку 'user_login', которую отправляет api-gateway
  @MessagePattern('user_login')
  async login(@Payload() data: LoginPayload) {
    return await this.authService.login(data);
  }
}
