import {
  Injectable, ConflictException, NotFoundException, Inject, forwardRef
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { UserRepositoryPort } from '../../../auth/domain/ports/user.repository.port';
import { UserEntity } from '../../../auth/domain/entities/user.entity';
import { CreateUserDto, UpdateUserDto, UserFilterDto } from '../../presentation/dtos/user.dto';
import { UserRole } from '../../../../common/enums/roles.enum';
import { ClassesService } from '../../../classes/application/use-cases/classes.service';
import { EnrollmentsService } from '../../../enrollments/application/use-cases/enrollments.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly config: ConfigService,
    @Inject(forwardRef(() => ClassesService))
    private readonly classesService: ClassesService,
    @Inject(forwardRef(() => EnrollmentsService))
    private readonly enrollmentsService: EnrollmentsService,
  ) {}

  async create(dto: CreateUserDto): Promise<UserEntity> {
    const exists = await this.userRepository.existsByEmail(dto.email);
    if (exists) {
      throw new ConflictException(`Ya existe un usuario con el email: ${dto.email}`);
    }
    const rounds = parseInt(this.config.get<string>('BCRYPT_ROUNDS', '10'), 10);
    const passwordHash = await bcrypt.hash(dto.password, rounds);
    // Usamos 'as any' para que TypeScript no bloquee la compilación por el error de tipado del repositorio.
    return this.userRepository.create({
      email: dto.email,
      name: dto.name,
      passwordHash,
      role: dto.role,
      phone: dto.phone,
      career: dto.career,
      department: dto.department,
      studentCode: dto.studentCode,
    } as any);
  }

  async findAll(filters?: UserFilterDto): Promise<UserEntity[]> {
    return this.userRepository.findAll(filters);
  }

  async findById(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserEntity> {
    await this.findById(id);
    
    const updatePayload: any = { ...dto };
    if (updatePayload.password) {
      const rounds = parseInt(this.config.get<string>('BCRYPT_ROUNDS', '10'), 10);
      updatePayload.passwordHash = await bcrypt.hash(updatePayload.password, rounds);
      delete updatePayload.password;
    }

    const updated = await this.userRepository.update(id, updatePayload);
    return updated!;
  }

  async delete(id: string): Promise<void> {
    const user = await this.findById(id);

    if (user.role === UserRole.STUDENT) {
      // Estudiante: Lo desinscribimos de todas sus clases activas para liberar los cupos
      const enrollments = await this.enrollmentsService.mySchedule(id);
      for (const enrollment of enrollments) {
        await this.enrollmentsService.unenroll((enrollment as any)._id.toString(), id);
      }
    } else if (user.role === UserRole.TEACHER) {
      // Profesor: Cancelamos todas sus clases que estén programadas
      const classes = await this.classesService.findByTeacher(id);
      for (const cls of classes) {
        if ((cls as any).status === 'scheduled') {
          // Forzamos el rol de ADMIN para que la cancelación no falle por
          // chequeos de permisos, ya que estamos en una operación de sistema.
          await this.classesService.cancel(
            (cls as any)._id.toString(),
            'El profesor ha sido eliminado del sistema.',
            id,
            UserRole.ADMIN,
          );
        }
      }
    }

    // Borrado Lógico: En lugar de eliminar, lo marcamos como inactivo
    await this.userRepository.update(id, { isActive: false });
  }

  async updateFcmToken(userId: string, fcmToken: string): Promise<void> {
    await this.userRepository.update(userId, { fcmToken });
  }
}
