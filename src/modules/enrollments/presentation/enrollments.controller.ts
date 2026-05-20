import {
  Controller, Get, Post, Delete,
  Body, Param, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EnrollmentsService } from '../application/use-cases/enrollments.service';
import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/presentation/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../../../common/enums/roles.enum';

class EnrollDto {
  @ApiProperty({ example: '65f4b2c8e4b0c23d4a8b1234' })
  @IsString()
  @IsNotEmpty()
  classId: string;

  @ApiProperty({ required: false, description: 'ID del estudiante (solo Admin)' })
  @IsOptional()
  @IsString()
  studentId?: string;
}

@ApiTags('enrollments')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  // ─── GET /enrollments (admin: reportería) ─────────────────────────────────
  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar historial completo de inscripciones (Reportería Admin)' })
  findAll() {
    return this.enrollmentsService.findAllForReporting();
  }

  // ─── GET /enrollments/my (estudiante: mi horario) ────────────────────────
  @Get('my')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Mi horario de clases (estudiante)' })
  mySchedule(@CurrentUser() user: any) {
    return this.enrollmentsService.mySchedule(user.id);
  }

  // ─── GET /enrollments/class/:classId (profesor/admin) ───────────────────
  @Get('class/:classId')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Estudiantes inscritos en una clase (profesor/admin)' })
  classStudents(@Param('classId') classId: string) {
    return this.enrollmentsService.getClassStudents(classId);
  }

  // ─── POST /enrollments (estudiante se inscribe) ──────────────────────────
  @Post()
  @Roles(UserRole.STUDENT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Inscribirse a una clase (estudiante/admin)' })
  enroll(@Body() dto: EnrollDto, @CurrentUser() user: any) {
    // Si es admin y mandó el ID, lo usamos. De lo contrario, usa el token actual
    const targetStudentId = (user.role === UserRole.ADMIN && dto.studentId) 
      ? dto.studentId 
      : user.id;
    return this.enrollmentsService.enroll(targetStudentId, dto.classId);
  }

  // ─── DELETE /enrollments/:id (estudiante se desinscribe) ─────────────────
  @Delete(':id')
  @Roles(UserRole.STUDENT, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desinscribirse de una clase (estudiante/admin)' })
  unenroll(@Param('id') id: string, @CurrentUser() user: any) {
    // Mandamos "admin" como un bypass temporal para el servicio
    const requestUserId = user.role === UserRole.ADMIN ? UserRole.ADMIN : user.id;
    return this.enrollmentsService.unenroll(id, requestUserId);
  }
}
