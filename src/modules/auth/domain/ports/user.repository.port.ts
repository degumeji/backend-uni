import { UserEntity } from '../entities/user.entity';
import { UserRole } from '../../../../common/enums/roles.enum';

export interface CreateUserDto {
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  fcmToken?: string;
  phone?: string;
  isActive?: boolean;
}

export interface UpdateUserDto {
  name?: string;
  fcmToken?: string;
  isActive?: boolean;
  passwordHash?: string;
  phone?: string;
  avatarUrl?: string;
}

// Este es el PORT (contrato) que define qué operaciones necesita el dominio.
// La implementación concreta (MongoDB, etc.) va en infrastructure/repositories.
export abstract class UserRepositoryPort {
  abstract findById(id: string): Promise<UserEntity | null>;
  abstract findByEmail(email: string): Promise<UserEntity | null>;
  abstract findByPasswordResetToken(token: string): Promise<UserEntity | null>;
  abstract findAll(filters?: { role?: UserRole; isActive?: boolean }): Promise<UserEntity[]>;
  abstract create(dto: CreateUserDto): Promise<UserEntity>;
  abstract update(id: string, dto: UpdateUserDto): Promise<UserEntity | null>;
  abstract delete(id: string): Promise<boolean>;
  abstract existsByEmail(email: string): Promise<boolean>;
  abstract setPasswordResetToken(id: string, token: string, expiresAt: Date): Promise<void>;
  abstract updatePasswordAndClearReset(id: string, passwordHash: string): Promise<void>;
}
