import {
  Injectable, NotFoundException, ForbiddenException, Inject, forwardRef,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ClassModel,
  ClassDocument,
  ClassStatus,
} from '../../infrastructure/schemas/class.schema';
import { UserRole } from '../../../../common/enums/roles.enum';
import { EnrollmentsService } from '../../../enrollments/application/use-cases/enrollments.service';

export interface CreateClassDto {
  title: string;
  subject: string;
  classroom?: string;
  mode: string;
  meetingUrl?: string;
  maxCapacity: number;
  description?: string;
  teacherId?: string;
  recurrence: {
    type: string;
    daysOfWeek?: number[];
    startTime: string;
    endTime: string;
    startDate: Date;
    endDate?: Date;
  };
}

export interface UpdateClassDto {
  title?: string;
  subject?: string;
  classroom?: string;
  mode?: string;
  meetingUrl?: string;
  maxCapacity?: number;
  description?: string;
  teacherId?: string;
  status?: ClassStatus;
  cancelledReason?: string;
  recurrence?: {
    type: string;
    daysOfWeek?: number[];
    startTime: string;
    endTime: string;
    startDate: Date;
    endDate?: Date;
  };
}

export interface ClassFilter {
  subject?: string;
  teacherId?: string;
  status?: ClassStatus;
  mode?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

@Injectable()
export class ClassesService {
  constructor(
    @InjectModel(ClassModel.name)
    private readonly classModel: Model<ClassDocument>,
    @Inject(forwardRef(() => EnrollmentsService))
    private readonly enrollmentsService: EnrollmentsService,
  ) {}

  async create(teacherId: string, dto: CreateClassDto) {
    const assignedTeacherId = dto.teacherId || teacherId;

    const newClass = new this.classModel({
      ...dto,
      teacher: new Types.ObjectId(assignedTeacherId),
    });
    const saved = await newClass.save();
    return (saved as any).populate('teacher', 'name email');
  }

  async findAll(filters: ClassFilter = {}) {
    const query: any = {};
    if (filters.subject) query.subject = { $regex: filters.subject, $options: 'i' };
    if (filters.teacherId) query.teacher = new Types.ObjectId(filters.teacherId);
    if (filters.status) query.status = filters.status;
    if (filters.mode) query.mode = filters.mode;
    if (filters.dateFrom || filters.dateTo) {
      query['recurrence.startDate'] = {};
      if (filters.dateFrom) query['recurrence.startDate'].$gte = filters.dateFrom;
      if (filters.dateTo) query['recurrence.startDate'].$lte = filters.dateTo;
    }

    return this.classModel
      .find(query)
      .populate('teacher', 'name email department')
      .sort({ 'recurrence.startDate': 1 })
      .exec();
  }

  // Devuelve una lista de materias únicas basándose en las clases creadas
  async getUniqueSubjects(): Promise<string[]> {
    return this.classModel.distinct('subject').exec();
  }

  async findById(id: string) {
    const cls = await this.classModel
      .findById(id)
      .populate('teacher', 'name email department')
      .exec();
    if (!cls) throw new NotFoundException(`Clase con id ${id} no encontrada`);
    return cls;
  }

  async findByTeacher(teacherId: string) {
    return this.classModel
      .find({ teacher: new Types.ObjectId(teacherId) })
      .sort({ 'recurrence.startDate': -1 })
      .exec();
  }

  async update(
    id: string,
    dto: UpdateClassDto,
    requesterId: string,
    requesterRole: UserRole,
  ) {
    const cls = await this.findById(id);
    if (
      requesterRole !== UserRole.ADMIN &&
      (cls.teacher as any)._id.toString() !== requesterId
    ) {
      throw new ForbiddenException('Solo puedes editar tus propias clases');
    }
    return this.classModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .populate('teacher', 'name email')
      .exec();
  }

  async cancel(id: string, reason: string, requesterId: string, requesterRole: UserRole) {
    return this.update(
      id,
      { status: ClassStatus.CANCELLED, cancelledReason: reason },
      requesterId,
      requesterRole,
    );
  }

  async delete(id: string) {
    await this.findById(id);
    await this.classModel.findByIdAndDelete(id).exec();
    return { message: 'Clase eliminada exitosamente' };
  }

  async incrementEnrolled(classId: string): Promise<void> {
    const cls = await this.classModel.findById(classId).exec();
    if (!cls) throw new NotFoundException('Clase no encontrada');
    if (cls.enrolledCount >= cls.maxCapacity) {
      throw new BadRequestException('La clase está llena');
    }
    await this.classModel.findByIdAndUpdate(classId, { $inc: { enrolledCount: 1 } }).exec();
  }

  async decrementEnrolled(classId: string): Promise<void> {
    await this.classModel
      .findByIdAndUpdate(classId, { $inc: { enrolledCount: -1 } })
      .exec();
  }

  async incrementHistoricalEnrolled(classId: string): Promise<void> {
    await this.classModel
      .findByIdAndUpdate(classId, { $inc: { historicalEnrolledCount: 1 } })
      .exec();
  }

  async syncEnrollmentCounts(): Promise<{ synced: number; total: number }> {
    const classes = await this.classModel.find().select('_id enrolledCount').exec();
    let synced = 0;

    for (const cls of classes) {
      const correctCount = await this.enrollmentsService.countActiveByClass(cls._id.toString());
      if (cls.enrolledCount !== correctCount) {
        await this.classModel.findByIdAndUpdate(cls._id, { enrolledCount: correctCount });
        synced += 1;
      }
    }

    return { synced, total: classes.length };
  }
}
