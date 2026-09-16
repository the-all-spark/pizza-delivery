// Валидация редактирования

/**
 * При редактировании профиля все поля должны быть необязательными (@IsOptional),
 * так как пользователь может захотеть изменить только имя, или только пароль
 */

import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString({ message: 'Имя должно быть строкой' })
  @IsNotEmpty({ message: 'Имя не может быть пустым' })
  @MaxLength(100, { message: 'Имя не должно превышать 100 символов' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Фамилия должна быть строкой' })
  @IsNotEmpty({ message: 'Фамилия не может быть пустой' })
  @MaxLength(100, { message: 'Фамилия не должна превышать 100 символов' })
  lastName?: string;

  @IsOptional()
  @IsString({ message: 'Пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Пароль не может быть пустым' })
  @MinLength(6, { message: 'Пароль должен быть не менее 6 символов' })
  @MaxLength(255, { message: 'Пароль не должен превышать 255 символов' })
  password?: string;
}
