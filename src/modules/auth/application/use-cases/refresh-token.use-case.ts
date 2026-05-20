import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenServicePort, TokenPair } from '../../domain/ports/token.service.port';
import { UserRepositoryPort } from '../../domain/ports/user.repository.port';

export interface RefreshTokenInput {
  refreshToken: string;
}

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly tokenService: TokenServicePort,
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(input: RefreshTokenInput): Promise<TokenPair> {
    // 1. Verificar que el refresh token sea válido
    const payload = await this.tokenService.verifyRefreshToken(input.refreshToken).catch(() => {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    });

    // 2. Verificar que no esté en blacklist
    const isBlacklisted = await this.tokenService.isTokenBlacklisted(input.refreshToken);
    if (isBlacklisted) {
      throw new UnauthorizedException('Sesión expirada. Inicia sesión de nuevo');
    }

    // 3. Verificar que el usuario siga activo
    const user = await this.userRepository.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuario no encontrado o desactivado');
    }

    // 4. Invalidar el refresh token actual (rotación de tokens)
    await this.tokenService.blacklistToken(input.refreshToken, 7 * 24 * 60 * 60);

    // 5. Generar nuevo par de tokens
    return this.tokenService.generateTokenPair({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }
}
