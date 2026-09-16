//Валидация поиска

import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SearchUserQueryDto {
  @IsString({ message: 'Имя должно быть строкой' })
  @IsNotEmpty({ message: 'Имя не может быть пустым' })
  @MaxLength(100, { message: 'Имя не должно превышать 100 символов' })
  firstName: string;

  @IsString({ message: 'Фамилия должна быть строкой' })
  @IsNotEmpty({ message: 'Фамилия не может быть пустой' })
  @MaxLength(100, { message: 'Фамилия не должна превышать 100 символов' })
  lastName: string;
}
