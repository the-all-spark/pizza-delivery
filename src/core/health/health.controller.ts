import { Controller, Get, Inject } from '@nestjs/common';
import { HealthCheckService, MicroserviceHealthIndicator, HealthCheck } from '@nestjs/terminus';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Transport, RmqOptions, ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { Public } from '@apps/api-gateway/src/decorators/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private rabbitmq: MicroserviceHealthIndicator,
    private configService: ConfigService,

    @Inject('PIZZA_SERVICE') private readonly pizzaClient: ClientProxy,
  ) {}

  @Get()
  @HealthCheck()
  @Public()
  @ApiOperation({
    summary: 'Check API, Broker and Microservice DB status',
    description: 'Returns the health status of the API Gateway, RabbitMQ, and delegated Pizza Service Database.',
  })
  @ApiOkResponse({ description: 'The systems are healthy.' })
  check() {
    const rmqUrl = this.configService.get<string>('RABBITMQ_URL', 'amqp://localhost:5672');

    return this.health.check([
      // Проверка самого шлюза (HTTP)
      () => ({ gateway: { status: 'up' } }),
      
      // Проверка доступности брокера RabbitMQ со стороны шлюза
      () => this.rabbitmq.pingCheck<RmqOptions>('rabbitmq_broker', {
        transport: Transport.RMQ,
        options: { urls: [rmqUrl] },
      }),

      // Делегированная проверка базы данных через микросервис пицц
      async () => {
        try {
          const response = await firstValueFrom(
            this.pizzaClient.send('pizza_service_ping_db', {}),
          );

          if (!response || response.status !== 'up') {
            throw new Error(response?.message || 'Pizza Database check failed');
          }

          return { pizza_database: { status: 'up' } };
        } catch (error: any) {
          throw new Error(`Pizza Database is unreachable: ${error.message}`);
        }
      },
    ]);
  }
}
