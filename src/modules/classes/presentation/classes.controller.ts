import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ClassesService } from '../application/use-cases/classes.service';
import {
  CreateClassDto, UpdateClassDto, CancelClassDto, ClassFilterDto,
} from './dtos/class.dto';
import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/presentation/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../../../common/enums/roles.enum';

@ApiTags('classes')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  // ─── GET /classes ────────────────────────────────────────────────────────
  @Get()
  @ApiOperation({ summary: 'Listar clases disponibles (todos los roles)' })
  findAll(@Query() filters: ClassFilterDto) {
    return this.classesService.findAll(filters);
  }

  // ─── GET /classes/my (profesor ve sus clases) ────────────────────────────
  @Get('my')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Mis clases (profesor)' })
  myClasses(@CurrentUser() user: any) {
    return this.classesService.findByTeacher(user.id);
  }

  // ─── GET /classes/:id ────────────────────────────────────────────────────
  @Get(':id')
  @ApiOperation({ summary: 'Ver detalle de una clase' })
  findOne(@Param('id') id: string) {
    return this.classesService.findById(id);
  }

  // ─── POST /classes (teacher | admin) ────────────────────────────────────
  @Post()
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear clase (profesor o admin)' })
  create(@Body() dto: CreateClassDto, @CurrentUser() user: any) {
    return this.classesService.create(user.id, dto);
  }

  // ─── PATCH /classes/:id ──────────────────────────────────────────────────
  @Patch(':id')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar clase' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateClassDto,
    @CurrentUser() user: any,
  ) {
    return this.classesService.update(id, dto, user.id, user.role);
  }

  // ─── PATCH /classes/:id/cancel ───────────────────────────────────────────
  @Patch(':id/cancel')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Cancelar clase con motivo' })
  cancel(
    @Param('id') id: string,
    @Body() dto: CancelClassDto,
    @CurrentUser() user: any,
  ) {
    return this.classesService.cancel(id, dto.reason, user.id, user.role);
  }

  // ─── DELETE /classes/:id (admin) ─────────────────────────────────────────
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar clase (admin)' })
  delete(@Param('id') id: string) {
    return this.classesService.delete(id);
  }

  // ─── POST /classes/sync-enrollments (admin) ──────────────────────────────
  @Post('sync-enrollments')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sincronizar contadores de inscritos (admin)' })
  syncEnrollments() {
    return this.classesService.syncEnrollmentCounts();
  }
}
