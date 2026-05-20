import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiBearerAuth, ApiOperation, ApiResponse,
} from '@nestjs/swagger';
import { UsersService } from '../application/use-cases/users.service';
import { CreateUserDto, UpdateUserDto, UserFilterDto } from './dtos/user.dto';
import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/presentation/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../../../common/enums/roles.enum';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ─── GET /users (admin) ──────────────────────────────────────────────────
  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar todos los usuarios (admin)' })
  findAll(@Query() filters: UserFilterDto) {
    return this.usersService.findAll(filters);
  }

  // ─── GET /users/:id ──────────────────────────────────────────────────────
  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener usuario por ID (admin)' })
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  // ─── GET /users/me/profile ───────────────────────────────────────────────
  @Get('me/profile')
  @ApiOperation({ summary: 'Ver mi propio perfil' })
  myProfile(@CurrentUser() user: any) {
    return this.usersService.findById(user.id);
  }

  // ─── POST /users (admin) ─────────────────────────────────────────────────
  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear usuario (admin)' })
  @ApiResponse({ status: 201, description: 'Usuario creado' })
  @ApiResponse({ status: 409, description: 'Email ya registrado' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  // ─── PATCH /users/:id (admin) ────────────────────────────────────────────
  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar usuario (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  // ─── PATCH /users/me/fcm-token ───────────────────────────────────────────
  @Patch('me/fcm-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar FCM token del dispositivo actual' })
  updateFcmToken(
    @CurrentUser() user: any,
    @Body() body: { fcmToken: string },
  ) {
    return this.usersService.updateFcmToken(user.id, body.fcmToken);
  }

  // ─── DELETE /users/:id (admin) ───────────────────────────────────────────
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar usuario (admin)' })
  delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
