import { SetMetadata } from '@nestjs/common';

// Маркер (эндпоинт доступен без JWT токена)
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
