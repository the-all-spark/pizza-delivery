import { SetMetadata } from '@nestjs/common';

// Маркер, который говорит шлюзу: "Этот эндпоинт доступен без JWT токена"
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
