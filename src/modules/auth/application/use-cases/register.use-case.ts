import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserRepositoryPort } from '../../domain/ports/user.repository.port';
import { TokenServicePort, TokenPair } from '../../domain/ports/token.service.port';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserRole } from '../../../../common/enums/roles.enum';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  phone?: string;
}

export interface RegisterOutput {
  tokens: TokenPair;
  user: ReturnType<UserEntity['toPublicProfile']>;
}

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly tokenService: TokenServicePort,
  ) {}

  async execute(input: RegisterInput): Promise<RegisterOutput> {
    // Validar rol permitido en registro público (admin no se autorregistra)
    const role = input.role || UserRole.STUDENT;
    if (role === UserRole.ADMIN) {
      throw new BadRequestException('No se permite el registro directo como administrador');
    }

    // Verificar email no usado
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictException('Ya existe una cuenta con ese correo');
    }

    // Hash de contraseña
    const passwordHash = await bcrypt.hash(input.password, 12);

    // Crear usuario
    const user = await this.userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role,
      phone: input.phone || null,
      isActive: true,
    } as any);

    // Generar tokens
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
