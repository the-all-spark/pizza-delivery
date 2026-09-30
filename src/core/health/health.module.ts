import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices'; 

@Module({
  imports: [
    TerminusModule,
    ConfigModule,

    ClientsModule.registerAsync([
      {
        name: 'PIZZA_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL', 'amqp://localhost:5672')],
            queue: 'pizza_queue',
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
  ],
  controllers: [HealthController],
})
export class HealthModule {}
