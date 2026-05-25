import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateRatingDto {
  @ApiProperty({ example: '60d5ecb74f1b2c001f8e4c1a', description: 'ID del profesor' })
  @IsMongoId()
  teacherId: string;

  @ApiProperty({ example: '60d5ecb74f1b2c001f8e4c1b', description: 'ID de la clase' })
  @IsMongoId()
  classId: string;

  @ApiProperty({ example: 5, description: 'Calificación del 1 al 5', minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  score: number;

  @ApiProperty({ required: false, example: '¡Excelente explicación!', description: 'Comentario opcional' })
  @IsOptional()
  @IsString()
  comment?: string;
}
