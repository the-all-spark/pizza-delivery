//Валидация поиска

import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SearchUserQueryDto {
  @IsOptional() // Если параметра нет в URL, валидация пропустит его
  @IsString({ message: 'Имя должно быть строкой' })
  @MaxLength(100, { message: 'Имя не должно превышать 100 символов' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Фамилия должна быть строкой' })
  @MaxLength(100, { message: 'Фамилия не должна превышать 100 символов' })
  lastName?: string;
}