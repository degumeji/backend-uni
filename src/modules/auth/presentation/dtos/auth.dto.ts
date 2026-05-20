import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

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

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token JWT' })
  @IsString()
  @IsNotEmpty({ message: 'refreshToken es requerido' })
  refreshToken: string;
}

export class LogoutDto {
  @ApiProperty({ required: false, description: 'Refresh token para invalidar sesión completa' })
  @IsString()
  refreshToken?: string;
}
