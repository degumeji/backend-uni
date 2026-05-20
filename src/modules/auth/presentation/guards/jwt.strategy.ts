import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from '../../domain/ports/token.service.port';
import { TokenServicePort } from '../../domain/ports/token.service.port';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private readonly tokenService: TokenServicePort,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_ACCESS_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: TokenPayload) {
    // Extraer el token del header para verificar blacklist
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    if (token && await this.tokenService.isTokenBlacklisted(token)) {
      throw new UnauthorizedException('Sesión terminada. Inicia sesión de nuevo');
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
