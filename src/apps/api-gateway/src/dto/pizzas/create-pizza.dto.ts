import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, IsNumberString } from 'class-validator';

export class CreatePizzaDto {
  @ApiProperty({
    example: 'Pepperoni',
    description: 'Pizza title',
    maxLength: 255,
  })
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title cannot be empty' })
  @MaxLength(255, { message: 'Title must not exceed 255 characters' })
  title: string;

  @ApiProperty({
    example: 'Classic pizza with spicy pepperoni and mozzarella',
    description: 'Pizza description',
  })
  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description cannot be empty' })
  description: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Pizza image file (PNG/JPG)',
  })
  image: any;

  @ApiProperty({ example: '25.00', description: 'Base pizza price' })
  @IsNumberString({}, { message: 'Price must be a valid number' })
  @IsNotEmpty({ message: 'Price cannot be empty' })
  price: string;

  @ApiProperty({
    example: '1,2,3,5',
    description:
      'IDs of ingredients for this pizza, listed separated by commas (NO SPACES) or in [1,2,3,5] format',
    type: String,
  })
  @IsString({
    message: 'Ingredients must be passed as a text string',
  })
  @IsNotEmpty({
    message: 'Pizza cannot be empty! Add at least one ingredient',
  })
  ingredients: any;
}
