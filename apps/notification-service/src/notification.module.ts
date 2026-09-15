import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationService } from './notification.service';
import { NotificationConsumer } from './notification.consumer';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [NotificationService, NotificationConsumer],
})
export class NotificationServiceModule {}
