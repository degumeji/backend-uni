import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../../../../common/enums/roles.enum';

export type UserDocument = UserModel & Document;

@Schema({ timestamps: true, collection: 'users' })
export class UserModel {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.STUDENT,
  })
  role: UserRole;

  @Prop({ default: null })
  fcmToken: string;

  @Prop({ default: true })
  isActive: boolean;

  // Para profesores
  @Prop({ default: null })
  department: string;

  // Para estudiantes
  @Prop({ default: null })
  career: string;

  @Prop({ default: null })
  studentCode: string;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);

// Índices para búsqueda eficiente
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1, isActive: 1 });
