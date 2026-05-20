import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EnrollmentDocument = EnrollmentModel & Document;

export enum EnrollmentStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  WAITLIST = 'waitlist',
}

@Schema({ timestamps: true, collection: 'enrollments' })
export class EnrollmentModel {
  @Prop({ type: Types.ObjectId, ref: 'UserModel', required: true })
  student: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ClassModel', required: true })
  class: Types.ObjectId;

  @Prop({ type: String, enum: EnrollmentStatus, default: EnrollmentStatus.ACTIVE })
  status: EnrollmentStatus;
}

export const EnrollmentSchema = SchemaFactory.createForClass(EnrollmentModel);

// Evitar inscripciones duplicadas
EnrollmentSchema.index({ student: 1, class: 1 }, { unique: true });
EnrollmentSchema.index({ student: 1, status: 1 });
