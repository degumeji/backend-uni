import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsString, IsNotEmpty, IsEnum, IsOptional,
  IsNumber, Min, Max, IsArray, IsDate, IsUrl, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ClassMode, ClassStatus, RecurrenceType } from '../../infrastructure/schemas/class.schema';

export class RecurrenceDto {
  @ApiProperty({ enum: RecurrenceType, example: RecurrenceType.WEEKLY })
  @IsEnum(RecurrenceType)
  type: RecurrenceType;

  @ApiProperty({ example: [1, 3, 5], description: '0=Dom, 1=Lun, ..., 6=Sáb', required: false })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  daysOfWeek?: number[];

  @ApiProperty({ example: '08:00', description: 'Hora inicio HH:mm' })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ example: '10:00', description: 'Hora fin HH:mm' })
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({ example: '2024-03-01' })
  @IsDate()
  startDate: Date;

  @ApiProperty({ example: '2024-06-30', required: false })
  @IsOptional()
  @IsDate()
  endDate?: Date;
}

export class CreateClassDto {
  @ApiProperty({ example: 'Cálculo II - Grupo A' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Cálculo' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ example: 'Aula 301', required: false })
  @IsOptional()
  @IsString()
  classroom?: string;

  @ApiProperty({ enum: ClassMode, default: ClassMode.PRESENTIAL })
  @IsEnum(ClassMode)
  mode: ClassMode;

  @ApiProperty({ required: false, example: 'https://meet.google.com/xxx' })
  @IsOptional()
  @IsString()
  meetingUrl?: string;

  @ApiProperty({ example: 30, minimum: 1, maximum: 200 })
  @IsNumber()
  @Min(1)
  @Max(200)
  maxCapacity: number;

  @ApiProperty({ required: false, description: 'ID del profesor asignado (Opcional, usado por Admin)' })
  @IsOptional()
  @IsString()
  teacherId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: RecurrenceDto })
  @ValidateNested()
  @Type(() => RecurrenceDto)
  recurrence: RecurrenceDto;
}

export class UpdateClassDto extends PartialType(CreateClassDto) {}

export class CancelClassDto {
  @ApiProperty({ example: 'El profesor está enfermo' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class ClassFilterDto {
  @IsOptional() @IsString() subject?: string;
  @IsOptional() @IsString() teacherId?: string;
  @IsOptional() @IsEnum(ClassStatus) status?: ClassStatus;
  @IsOptional() @IsEnum(ClassMode) mode?: ClassMode;
  @IsOptional() @IsDate() dateFrom?: Date;
  @IsOptional() @IsDate() dateTo?: Date;
}
