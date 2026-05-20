import { Injectable } from '@nestjs/common';
import { TokenServicePort } from '../../domain/ports/token.service.port';

export interface LogoutInput {
  accessToken: string;
  refreshToken?: string;
}

@Injectable()
export class LogoutUseCase {
  constructor(private readonly tokenService: TokenServicePort) {}

  async execute(input: LogoutInput): Promise<void> {
    // Blacklistear el access token (15 min TTL)
    await this.tokenService.blacklistToken(input.accessToken, 15 * 60);

    // Blacklistear también el refresh token si se envió (7 días TTL)
    if (input.refreshToken) {
      await this.tokenService.blacklistToken(input.refreshToken, 7 * 24 * 60 * 60);
    }
  }
}
