// не работает с базой данных

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationServiceService } from './notification-service.service';
import { NotificationConsumer } from './notification.consumer';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  providers: [
    NotificationServiceService,
    NotificationConsumer
  ],
})
export class NotificationServiceModule {}
