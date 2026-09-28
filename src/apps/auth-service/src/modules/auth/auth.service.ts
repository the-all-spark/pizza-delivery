// Логика регистрации и авторизации (хэширование с помощью bcrypt и генерация токенов)

import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';

import { User } from '../users/user.entity';
import { RegisterPayload } from '../../../../../src/apps/auth-service/src/modules/auth/interfaces/register-payload.interface';
import { LoginPayload } from '../../../../../src/apps/auth-service/src/modules/auth/interfaces/login-payload.interface';
import { RegisterResponse } from '../../../../../src/apps/auth-service/src/modules/auth/interfaces/register-response.interface';
import { LoginResponse } from '../../../../../src/apps/auth-service/src/modules/auth/interfaces/login-response.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,

    // Внедряем прокси-клиент RabbitMQ для уведомлений
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,
  ) {}

  // ==========================================
  // ЛОГИКА РЕГИСТРАЦИИ ПОЛЬЗОВАТЕЛЯ
  // ==========================================
  async register(payload: RegisterPayload): Promise<RegisterResponse> {
    // ! Проверка отправки email админу при критической ошибке
    // throw new Error('FATAL: Database connection lost on tables users');
    const { email, password, firstName, lastName } = payload;

    // 1. Проверяем, существует ли уже пользователь с таким email
    const candidate = await this.userRepository.findOne({ where: { email } });
    if (candidate) {
      // Выбрасываем RpcException вместо Http СonflictException
      throw new RpcException({
        statusCode: 409,
        message: 'A user with such email already exists.',
      });
    }

    // 2. Хэшируем чистый пароль. Число 10 — это соль (солт-раунды) для надежности шифрования
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 3. Создаем объект сущности. Роль по умолчанию USER выставится базой данных автоматически
    const newUser = this.userRepository.create({
      email,
      passwordHash,
      firstName,
      lastName,
    });

    // 4. Сохраняем пользователя в PostgreSQL
    const savedUser = await this.userRepository.save(newUser);

    // Отправляем событие о регистрации нового пользователя в RabbitMQ.
    // Сервис уведомлений (notification-service) поймает этот паттерн и вышлет приветственный email.
    this.notificationClient.emit('user_registered_event', {
      email: savedUser.email,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
    });

    // 5. Возвращаем созданного пользователя БЕЗ хэша пароля
    const { passwordHash: _, ...result } = savedUser;
    return result as RegisterResponse;
  }

  // ==========================================
  // ЛОГИКА АВТОРИЗАЦИИ И ГЕНЕРАЦИИ JWT
  // ==========================================
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const { email, password } = payload;

    // 1. Ищем пользователя по email
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new RpcException({
        statusCode: 401,
        message: 'Invalid email or password',
      });
    }

    // 2. Сравниваем чистый пароль из формы с хэшем из базы данных
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new RpcException({
        statusCode: 401,
        message: 'Invalid email or password',
      });
    }

    // 3. Формируем полезную нагрузку (payload) для JWT токена
    // sub — это стандартное JWT поле для ID субъекта
    const jwtPayload = {
      sub: user.uId,
      email: user.email,
      role: user.role,
    };

    // 4. Генерируем (подписываем) токен асинхронно
    const accessToken = await this.jwtService.signAsync(jwtPayload);

    // 5. Возвращаем структуру ответа, которую ожидает наш LoginResponseDto на шлюзе
    return {
      accessToken,
      tokenType: 'Bearer',
    };
  }
}
