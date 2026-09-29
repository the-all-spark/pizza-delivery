// * Модуль микросервиса отправки уведомлений

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationService } from './notification.service';
import { NotificationConsumer } from './notification.consumer';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [NotificationConsumer],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
