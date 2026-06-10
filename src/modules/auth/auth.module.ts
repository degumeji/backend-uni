import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Domain Ports (abstract)
import { UserRepositoryPort } from './domain/ports/user.repository.port';
import { TokenServicePort } from './domain/ports/token.service.port';

// Application Use Cases
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { ForgotPasswordUseCase } from './application/use-cases/forgot-password.use-case';

// Infrastructure Adapters
import { MongoUserRepository } from './infrastructure/repositories/mongo-user.repository';
import { JwtTokenService } from './infrastructure/services/jwt-token.service';
import { RedisBlacklistService } from './infrastructure/services/redis-blacklist.service';
import { UserModel, UserSchema } from './infrastructure/schemas/user.schema';

// Presentation
import { AuthController } from './presentation/auth.controller';
import { JwtStrategy } from './presentation/guards/jwt.strategy';
import { JwtAuthGuard } from './presentation/guards/jwt-auth.guard';
import { RolesGuard } from './presentation/guards/roles.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: config.get('JWT_ACCESS_EXPIRES_IN', '15m') },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }]),
  ],
  controllers: [AuthController],
  providers: [
    // ─── Infrastructure ─────────────────────────────────────────────────────
    RedisBlacklistService,

    // ─── Ports → Adapters (Dependency Inversion) ────────────────────────────
    // Aquí "conectamos" cada port abstracto con su implementación concreta
    {
      provide: UserRepositoryPort,
      useClass: MongoUserRepository,
    },
    {
      provide: TokenServicePort,
      useClass: JwtTokenService,
    },

    // ─── Use Cases ──────────────────────────────────────────────────────────
    LoginUseCase,
    RegisterUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    ForgotPasswordUseCase,

    // ─── Strategies & Guards ─────────────────────────────────────────────────
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [
    // Exportar para que otros módulos puedan usar los guards y el repositorio
    JwtAuthGuard,
    RolesGuard,
    UserRepositoryPort,
    TokenServicePort,
    PassportModule,
    JwtModule,
  ],
})
export class AuthModule {}
