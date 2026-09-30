import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatus } from '@shared/enums';

export class UpdateOrderStatusDto {
  @ApiProperty({
    example: OrderStatus.PROCESSING,
    enum: OrderStatus,
    description: 'New status for the admin to change',
  })
  @IsEnum(OrderStatus, { message: 'Invalid order status specified' })
  @IsNotEmpty({ message: 'Status is required' })
  status: OrderStatus;
}
