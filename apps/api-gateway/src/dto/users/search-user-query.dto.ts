//Валидация поиска

import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SearchUserQueryDto {
  @IsOptional() // Если параметра нет в URL, валидация пропустит его
  @IsString({ message: 'First name must be a string' })
  @MaxLength(100, { message: 'First name must not exceed 100 characters' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  @MaxLength(100, { message: 'Last name must not exceed 100 characters' })
  lastName?: string;
}
