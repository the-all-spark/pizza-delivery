import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min, MaxLength } from 'class-validator';

export class CreateIngredientDto {
  @ApiProperty({
    example: 'Mozzarella Cheese',
    description: 'Unique name of the pizza ingredient',
    maxLength: 150,
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name cannot be empty' })
  @MaxLength(150, { message: 'Name must not exceed 150 characters' })
  name: string;

  @ApiProperty({
    example: 2.5,
    description: 'Ingredient cost (added to the base pizza price)',
    minimum: 0,
  })
  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price cannot be negative' })
  price: number;
}
