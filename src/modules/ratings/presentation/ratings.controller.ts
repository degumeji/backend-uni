import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RatingsService } from '../application/use-cases/ratings.service';
import { CreateRatingDto } from './dtos/create-rating.dto';
import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/presentation/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/roles.enum';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('ratings')
@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Calificar una clase/profesor (Solo estudiantes)' })
  createRating(@Body() dto: CreateRatingDto, @CurrentUser() user: any) {
    return this.ratingsService.createRating(user.id, dto);
  }

  @Get('teacher/:id')
  @ApiOperation({ summary: 'Obtener reseñas y promedio de un profesor' })
  getTeacherRatings(@Param('id') teacherId: string) {
    return this.ratingsService.getTeacherStats(teacherId);
  }

  @Get('class/:classId')
  @ApiOperation({ summary: 'Obtener calificaciones de una clase específica' })
  getByClass(@Param('classId') classId: string) {
    return this.ratingsService.getByClass(classId);
  }
}
