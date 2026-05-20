import {
  Injectable, ConflictException, NotFoundException, ForbiddenException, Inject, forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  EnrollmentModel,
  EnrollmentDocument,
  EnrollmentStatus,
} from '../../infrastructure/schemas/enrollment.schema';
import { ClassesService } from '../../../classes/application/use-cases/classes.service';
import { UserRole } from '../../../../common/enums/roles.enum';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectModel(EnrollmentModel.name)
    private readonly enrollmentModel: Model<EnrollmentDocument>,
    @Inject(forwardRef(() => ClassesService))
    private readonly classesService: ClassesService,
  ) {}

  async enroll(studentId: string, classId: string) {
    const cls = await this.classesService.findById(classId);
    if ((cls as any).status === 'cancelled') {
      throw new ForbiddenException('No puedes inscribirte a una clase cancelada');
    }

    let enrollment = await this.enrollmentModel.findOne({
      student: new Types.ObjectId(studentId),
      class: new Types.ObjectId(classId),
    }).exec();

    if (enrollment && enrollment.status === EnrollmentStatus.ACTIVE) {
      throw new ConflictException('Ya estás inscrito en esta clase');
    }

    await this.classesService.incrementEnrolled(classId);

    if (enrollment) {
      enrollment.status = EnrollmentStatus.ACTIVE;
      await enrollment.save();
    } else {
      await this.classesService.incrementHistoricalEnrolled(classId);
      enrollment = new this.enrollmentModel({
        student: new Types.ObjectId(studentId),
        class: new Types.ObjectId(classId),
        status: EnrollmentStatus.ACTIVE,
      });
      await enrollment.save();
    }

    return enrollment.populate([
      { path: 'class', populate: { path: 'teacher', select: 'name email' } },
    ]);
  }

  async unenroll(enrollmentId: string, studentId: string) {
    const enrollment = await this.enrollmentModel.findById(enrollmentId).exec();
    if (!enrollment) throw new NotFoundException('Inscripción no encontrada');
    if (studentId !== UserRole.ADMIN && enrollment.student.toString() !== studentId) {
      throw new ForbiddenException('No puedes cancelar la inscripción de otro estudiante');
    }
    if (enrollment.status !== EnrollmentStatus.ACTIVE) {
      throw new ConflictException('La inscripción ya está cancelada');
    }

    await this.classesService.decrementEnrolled(enrollment.class.toString());
    enrollment.status = EnrollmentStatus.CANCELLED;
    return enrollment.save();
  }

  async mySchedule(studentId: string) {
    return this.enrollmentModel
      .find({
        student: new Types.ObjectId(studentId),
        status: EnrollmentStatus.ACTIVE,
      })
      .populate({
        path: 'class',
        populate: { path: 'teacher', select: 'name email department' },
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getClassStudents(classId: string) {
    return this.enrollmentModel
      .find({
        class: new Types.ObjectId(classId),
        status: EnrollmentStatus.ACTIVE,
      })
      .populate('student', 'name email studentCode career')
      .exec();
  }

  // Ideal para el módulo de Reportería del Administrador
  async findAllForReporting() {
    return this.enrollmentModel
      .find() // Trae todo el historial sin importar el estado
      .populate('student', 'name email role isActive')
      .populate({ path: 'class', select: 'title subject status teacher' })
      .sort({ createdAt: -1 })
      .exec();
  }

  async countActiveByClass(classId: string): Promise<number> {
    return this.enrollmentModel.countDocuments({
      class: new Types.ObjectId(classId),
      status: EnrollmentStatus.ACTIVE,
    }).exec();
  }
}
