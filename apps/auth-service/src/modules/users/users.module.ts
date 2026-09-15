import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller'; // Если планируете роуты для профиля/поиска

@Module({
  imports: [
    // Регистрируем сущность User в контексте данного модуля.
    // Теперь NestJS знает, что в этом модуле можно использовать InjectRepository(User)
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  
  // КРИТИЧЕСКИ ВАЖНО: экспортируем UsersService и TypeOrmModule,
  // чтобы AuthModule, который импортирует этот UsersModule, 
  // тоже получил доступ к репозиторию пользователей и методам поиска.
  exports: [UsersService, TypeOrmModule], 
})
export class UsersModule {}