import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { UserRepositoryPort } from '../../domain/ports/user.repository.port';

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

@Injectable()
export class ForgotPasswordUseCase {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  /**
   * Solicita recuperación de contraseña.
   *
   * Por seguridad SIEMPRE devuelve éxito (no revela si el email existe).
   * Genera un token, lo guarda con expiración de 1 hora y se debería enviar
   * por correo electrónico (mailer aún no integrado en Fase 1).
   *
   * Para desarrollo, retornamos el token en la respuesta cuando NODE_ENV !== production.
   */
  async requestReset(input: ForgotPasswordInput): Promise<{ message: string; resetToken?: string }> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      return { message: 'Si la cuenta existe, te enviaremos instrucciones por correo.' };
    }
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h
    await this.userRepository.setPasswordResetToken(user.id, token, expiresAt);

    // TODO Fase 2: enviar email con link `https://app/reset?token=${token}`
    const response: any = {
      message: 'Si la cuenta existe, te enviaremos instrucciones por correo.',
    };
    if (process.env.NODE_ENV !== 'production') {
      response.resetToken = token;
    }
    return response;
  }

  async resetPassword(input: ResetPasswordInput): Promise<{ message: string }> {
    if (!input.token || !input.password) {
      throw new BadRequestException('Token y contraseña son requeridos');
    }
    const user = await this.userRepository.findByPasswordResetToken(input.token);
    if (!user) {
      throw new BadRequestException('Token inválido o expirado');
    }
    const passwordHash = await bcrypt.hash(input.password, 12);
    await this.userRepository.updatePasswordAndClearReset(user.id, passwordHash);
    return { message: 'Contraseña actualizada exitosamente' };
  }
}
