// * Контроллер авторизации

/**
 *  Контроллеры шлюза описывают HTTP-эндпоинты и распределяют
 * права доступа с помощью декораторов @Public() и @Roles().
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
  ApiCreatedResponse,
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

  // * Регистрация (/auth/register)
  @Public() // Маршрут открыт для всех
  @Post('register')
  @ApiOperation({
    summary: 'New user registration',
    description:
      'Creates a new user account in the system. Sends data to the user microservice.',
  })
  // Описание успешного ответа
  @ApiCreatedResponse({
    description: 'The user has been successfully registered.',
    type: RegisterResponseDto,
  })
  // Описание других вариантов ответа (ошибки, кастомные статусы)
  @ApiResponse({
    status: 400,
    description: 'Form fields are filled out incorrectly (validation error).',
  })
  @ApiResponse({
    status: 409,
    description: 'A user with this email or login already exists.',
  })
  @ApiResponse({
    status: 500,
    description:
      'Internal server error while processing the request by the microservice.',
  })
  register(@Body() body: RegisterDto) {
    // Отправляем команду в auth_queue и ждем результат
    return this.authClient.send('user_register', body);
  }

  // * Авторизация (/auth/login)
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK) // Явно задаем 200 OK вместо дефолтного 201 для POST запросов
  @ApiOperation({
    summary: 'User authorization (log in)',
    description:
      'Verifies credentials (email/password) and returns a JWT token.',
  })
  @ApiOkResponse({
    description: 'Successful authorization. Returns a JWT token.',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid email or password.',
  })
  @ApiResponse({
    status: 400,
    description: 'Input data validation error.',
  })
  login(@Body() body: LoginDto) {
    return this.authClient.send('user_login', body);
  }
}
