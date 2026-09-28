// * Чтение (валидация): Проверяет уже готовый токен 1 раз для всех запросов

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../../../../src/apps/api-gateway/src/decorators/public.decorator';
import { ROLES_KEY } from '../../../../src/apps/api-gateway/src/decorators/roles.decorator';

@Injectable()
export class GatewayJwtGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Проверяем, помечен ли маршрут декоратором @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization token is missing or invalid.');
    }

    const token = authHeader.split(' ')[1];

    try {
      // Расшифровываем и проверяем токен
      const payload = await this.jwtService.verifyAsync(token);

      request['user'] = {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      // Проверяем роли пользователей
      const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

      if (!requiredRoles || requiredRoles.length === 0) {
        return true;
      }

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
