import { SetMetadata } from '@nestjs/common';

// Маркер, который задает список разрешенных ролей для эндпоинта
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
