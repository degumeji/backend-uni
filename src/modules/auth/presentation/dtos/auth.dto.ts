import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { UserRole } from '../../../../common/enums/roles.enum';

export class LoginDto {
  @ApiProperty({ example: 'juan@universidad.edu' })
  @IsEmail({}, { message: 'Email debe ser válido' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'MiPassword123' })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsNotEmpty()
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(80)
  name: string;

  @ApiProperty({ example: 'juan@correo.com' })
  @IsEmail({}, { message: 'Email debe ser válido' })
  email: string;

  @ApiProperty({ example: 'MiPassword123!' })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(128)
  password: string;

  @ApiPropertyOptional({ enum: [UserRole.STUDENT, UserRole.TEACHER], default: UserRole.STUDENT })
  @IsOptional()
  @IsEnum([UserRole.STUDENT, UserRole.TEACHER], { message: 'Rol no permitido en registro público' })
  role?: UserRole;

  @ApiPropertyOptional({ example: '+593987654321' })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token JWT' })
  @IsString()
  @IsNotEmpty({ message: 'refreshToken es requerido' })
  refreshToken: string;
}

export class LogoutDto {
  @ApiProperty({ required: false, description: 'Refresh token para invalidar sesión completa' })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'juan@correo.com' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token recibido por correo' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'NuevaPassword123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;
}
