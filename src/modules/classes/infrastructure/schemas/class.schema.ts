import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ClassDocument = ClassModel & Document;

export enum ClassMode {
  PRESENTIAL = 'presential',
  VIRTUAL = 'virtual',
  HYBRID = 'hybrid',
}

export enum ClassStatus {
  SCHEDULED = 'scheduled',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  IN_PROGRESS = 'in_progress',
}

export enum RecurrenceType {
  ONCE = 'once',
  DAILY = 'daily',
  WEEKLY = 'weekly',
}

@Schema({ _id: false })
class Recurrence {
  @Prop({ type: String, enum: RecurrenceType, default: RecurrenceType.ONCE })
  type: RecurrenceType;

  @Prop({ type: [Number], default: [] }) // 0=Dom, 1=Lun ... 6=Sáb
  daysOfWeek: number[];

  @Prop({ required: true }) // "08:00"
  startTime: string;

  @Prop({ required: true }) // "10:00"
  endTime: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ default: null })
  endDate: Date;
}

const RecurrenceSchema = SchemaFactory.createForClass(Recurrence);

@Schema({ timestamps: true, collection: 'classes' })
export class ClassModel {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  subject: string;

  @Prop({ type: Types.ObjectId, ref: 'UserModel', required: true })
  teacher: Types.ObjectId;

  @Prop({ default: null })
  classroom: string;

  @Prop({ type: String, enum: ClassMode, default: ClassMode.PRESENTIAL })
  mode: ClassMode;

  @Prop({ default: null })
  meetingUrl: string;

  @Prop({ required: true, min: 1, max: 200 })
  maxCapacity: number;

  @Prop({ default: 0 })
  enrolledCount: number;

  @Prop({ default: 0 })
  historicalEnrolledCount: number;

  @Prop({ type: String, enum: ClassStatus, default: ClassStatus.SCHEDULED })
  status: ClassStatus;

  @Prop({ type: RecurrenceSchema, required: true })
  recurrence: Recurrence;

  @Prop({ default: null })
  description: string;

  @Prop({ default: null })
  cancelledReason: string;
}

export const ClassSchema = SchemaFactory.createForClass(ClassModel);

ClassSchema.index({ teacher: 1, status: 1 });
ClassSchema.index({ subject: 1 });
ClassSchema.index({ 'recurrence.startDate': 1, status: 1 });
