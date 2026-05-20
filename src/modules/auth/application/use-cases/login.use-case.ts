import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserRepositoryPort } from '../../domain/ports/user.repository.port';
import { TokenServicePort, TokenPair } from '../../domain/ports/token.service.port';
import { UserEntity } from '../../domain/entities/user.entity';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput {
  tokens: TokenPair;
  user: ReturnType<UserEntity['toPublicProfile']>;
}

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly tokenService: TokenServicePort,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    // 1. Buscar usuario por email
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 2. Verificar que la cuenta esté activa
    if (!user.isActive) {
      throw new UnauthorizedException('Cuenta desactivada. Contacta al administrador');
    }

    // 3. Verificar contraseña
    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 4. Generar tokens
    const tokens = await this.tokenService.generateTokenPair({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      tokens,
      user: user.toPublicProfile(),
    };
  }
}
