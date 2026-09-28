// * Контроллер авторизации (эндпоинты доступны для всех)

import { Controller, Post, Body, UseFilters, Inject, HttpCode, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';

import { Public } from '../decorators/public.decorator';
import { RpcExceptionFilter } from '../rpc-exception.filter';

import { RegisterDto } from '../dto/auth/register.dto';
import { RegisterResponseDto } from '../dto/auth/register-response.dto';
import { LoginDto } from '../dto/auth/login.dto';
import { LoginResponseDto } from '../dto/auth/login-response.dto';

@ApiTags('Auth')
@Controller('auth')
@UseFilters(RpcExceptionFilter)
export class AuthGatewayController {
  constructor(@Inject('AUTH_SERVICE') private readonly authClient: ClientProxy) {}

  // * Регистрация (/auth/register)
  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'New user registration',
    description: 'Creates a new user account in the system. Sends data to the user microservice.',
  })
  @ApiCreatedResponse({
    description: 'The user has been successfully registered.',
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Form fields are filled out incorrectly (validation error).',
  })
  @ApiResponse({
    status: 409,
    description: 'A user with this email or login already exists.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error while processing the request by the microservice.',
  })
  register(@Body() body: RegisterDto) {
    return this.authClient.send('user_register', body);
  }

  // * Авторизация (/auth/login)
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User authorization (log in)',
    description: 'Verifies credentials (email/password) and returns a JWT token.',
  })
  @ApiOkResponse({
    description: 'Successful authorization. Returns a JWT token.',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid email or password.',
  })
  @ApiResponse({
    status: 400,
    description: 'Input data validation error.',
  })
  login(@Body() body: LoginDto) {
    return this.authClient.send('user_login', body);
  }
}
