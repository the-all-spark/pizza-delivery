// * Контроллер авторизации

/**
 *  Контроллеры шлюза описывают HTTP-эндпоинты и распределяют права доступа
 * с помощью декораторов @Public() и @Roles().
 * Для отправки запросов в RabbitMQ используется метод this.client.send(pattern, payload).
 * Он возвращает Observable, который NestJS автоматически превращает в HTTP-ответ
 * после получения данных от микросервиса.
 */

import {
  Controller,
  Post,
  Body,
  UseFilters,
  Inject,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiOkResponse,
} from '@nestjs/swagger';
import { Public } from '../decorators/public.decorator';
import { RpcExceptionFilter } from '../rpc-exception.filter';

// DTO для валидации входящих данных
import { RegisterDto } from '../dto/auth/register.dto';
import { RegisterResponseDto } from '../dto/auth/register-response.dto';
import { LoginDto } from '../dto/auth/login.dto';
import { LoginResponseDto } from '../dto/auth/login-response.dto';

@ApiTags('Auth') // Тег
@Controller('auth') // Базовый префикс для всех роутов внутри класса
@UseFilters(RpcExceptionFilter) // Применяем фильтр ошибок к контроллеру
export class AuthGatewayController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  // * /auth/register
  @Public() // Маршрут открыт для всех
  @Post('register')
  @ApiOperation({
    summary: 'Регистрация нового пользователя',
    description:
      'Создает новый аккаунт пользователя в системе. Отправляет данные в микросервис пользователей.',
  })
  // Описание успешного ответа
  @ApiResponse({
    status: 201,
    description: 'Пользователь успешно зарегистрирован.',
    type: RegisterResponseDto,
  })
  // Описание других вариантов ответа (ошибки, кастомные статусы)
  @ApiResponse({
    status: 400,
    description: 'Неверно заполнены поля формы (ошибка валидации).',
  })
  @ApiResponse({
    status: 409,
    description: 'Пользователь c таким Email или Login уже существует.',
  })
  @ApiResponse({
    status: 500,
    description:
      'Внутренняя ошибка сервера при обработке запроса микросервисом.',
  })

  // с DTO: Swagger отобразит интерактивную форму с примерами ('example' из RegisterDto)
  register(@Body() body: RegisterDto) {
    // Отправляем команду в auth_queue и ждем результат
    return this.authClient.send('user_register', body);
  }

  // * /auth/login
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK) // Явно задаем 200 OK вместо дефолтного 201 для POST запросов
  @ApiOperation({
    summary: 'Авторизация пользователя (вход)',
    description:
      'Проверяет учетные данные (email/password) и возвращает JWT-токен.',
  })
  // Используем специализированный декоратор для 200 OK
  @ApiOkResponse({
    description: 'Успешная авторизация. Возвращает JWT токен.',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Неверный email или пароль.',
  })
  @ApiResponse({
    status: 400,
    description: 'Ошибка валидации входных данных.',
  })
  login(@Body() body: LoginDto) {
    return this.authClient.send('user_login', body);
  }
}
