import { Module } from '@nestjs/common';
import { AuthServiceController } from './auth.controller';
import { AuthServiceService } from './auth.service';

@Module({
  imports: [],
  controllers: [AuthServiceController],
  providers: [AuthServiceService],
})
export class AuthModule {}


