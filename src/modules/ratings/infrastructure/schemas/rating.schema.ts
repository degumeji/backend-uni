import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RatingDocument = RatingModel & Document;

@Schema({ timestamps: true, collection: 'ratings' })
export class RatingModel {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  studentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  teacherId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Class', required: true })
  classId: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  score: number;

  @Prop({ required: false, type: String })
  comment?: string;
}

export const RatingSchema = SchemaFactory.createForClass(RatingModel);

// Índice compuesto para garantizar la unicidad: 
// Un estudiante solo puede dejar una calificación por clase impartida
RatingSchema.index({ studentId: 1, classId: 1 }, { unique: true });
