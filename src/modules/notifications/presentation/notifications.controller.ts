import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NotificationsService, NotificationType } from '../infrastructure/services/fcm-notifications.service';
import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/presentation/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/roles.enum';

class SendNotificationDto {
  @ApiProperty({ example: ['userId1', 'userId2'] })
  @IsArray()
  userIds: string[];

  @ApiProperty({ example: 'Cambio de aula' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'La clase se traslada al Aula 205' })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiProperty({ enum: NotificationType, default: NotificationType.GENERAL })
  @IsEnum(NotificationType)
  type: NotificationType;
}

@ApiTags('notifications')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Enviar notificación push (admin/profesor)' })
  sendNotification(@Body() dto: SendNotificationDto) {
    return this.notificationsService.sendToUsers(dto);
  }
}
