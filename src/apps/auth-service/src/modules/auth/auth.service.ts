// * Логика регистрации и авторизации (хэширование с помощью bcrypt и генерация токенов)

import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';

import { User } from '../users/user.entity';
import { RegisterPayload } from '../auth/interfaces/register-payload.interface';
import { LoginPayload } from '../auth/interfaces/login-payload.interface';
import { RegisterResponse } from '../auth/interfaces/register-response.interface';
import { LoginResponse } from '../auth/interfaces/login-response.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,

    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,
  ) {}

  // ==========================================
  // ЛОГИКА РЕГИСТРАЦИИ ПОЛЬЗОВАТЕЛЯ
  // ==========================================
  async register(payload: RegisterPayload): Promise<RegisterResponse> {
    const { email, password, firstName, lastName } = payload;

    const candidate = await this.userRepository.findOne({ where: { email } });
    if (candidate) {
      throw new RpcException({
        statusCode: 409,
        message: 'A user with such email already exists.',
      });
    }

    // Хэшируем чистый пароль
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Создаем объект сущности, сохраняем в БД
    const newUser = this.userRepository.create({
      email,
      passwordHash,
      firstName,
      lastName,
    });

    const savedUser = await this.userRepository.save(newUser);

    // Отправляем событие о регистрации нового пользователя в RabbitMQ
    this.notificationClient.emit('user_registered_event', {
      email: savedUser.email,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
    });

    const { passwordHash: _, ...result } = savedUser;
    return result as RegisterResponse;
  }

  // ==========================================
  // ЛОГИКА АВТОРИЗАЦИИ И ГЕНЕРАЦИИ JWT
  // ==========================================
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const { email, password } = payload;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new RpcException({
        statusCode: 401,
        message: 'Invalid email or password',
      });
    }

    // Сравниваем чистый пароль из формы с хэшем из базы данных
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new RpcException({
        statusCode: 401,
        message: 'Invalid email or password',
      });
    }

    // Формируем полезную нагрузку (payload) для JWT токена
    const jwtPayload = {
      sub: user.uId,
      email: user.email,
      role: user.role,
    };

    // Генерируем токен
    const accessToken = await this.jwtService.signAsync(jwtPayload);

    return {
      accessToken,
      tokenType: 'Bearer',
    };
  }
}
