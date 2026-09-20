// * Чтение (валидация): Проверяет уже готовый токен ОДИН раз для всех запросов
// Шлюз никогда не создает новые токены

/**
 * комплексный Guard, который последовательно:
 * Проверяет, не является ли маршрут публичным.
 * Извлекает и валидирует JWT-токен из заголовка Authorization.
 * Проверяет, соответствует ли роль пользователя (user/admin) требованиям ТЗ.
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class GatewayJwtGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Проверяем, помечен ли маршрут декоратором @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true; // Если публичный — пропускаем без проверок
    }

    // 2. Извлекаем HTTP-запрос
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Authorization token is missing or invalid.',
      );
    }

    const token = authHeader.split(' ')[1];

    try {
      // 3. Расшифровываем и проверяем токен
      // «Не подделан ли токен? Настоящая ли на нем подпись? Какая внутри роль?»
      const payload = await this.jwtService.verifyAsync(token);

      // Добавляем игнорирование срока действия для локальных тестов в Thunder Client
      // Игнорируем срок действия для тестирования токенов без полей iat/exp
      // const payload = await this.jwtService.verifyAsync(token, {
      //   ignoreExpiration: true,
      // });

      // Сохраняем данные пользователя в объект запроса, чтобы контроллер мог их прочитать
      request['user'] = {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      // 4. Проверяем роли пользователей (Авторизация по ролям)
      const requiredRoles = this.reflector.getAllAndOverride<string[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );

      // Если у маршрута нет ограничений по ролям, значит он доступен любому авторизованному пользователю
      if (!requiredRoles || requiredRoles.length === 0) {
        return true;
      }

      // Проверяем, есть ли роль пользователя в списке разрешенных для этого эндпоинта
      const hasRole = requiredRoles.includes(payload.role);
      if (!hasRole) {
        throw new ForbiddenException(
          'You do not have sufficient permissions to access this resource.',
        );
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException('The token has expired or is corrupted.');
    }
  }
}
