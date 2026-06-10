import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../../../../common/enums/roles.enum';

export type UserDocument = UserModel & Document;

/**
 * StudentProfile — datos específicos del estudiante.
 */
@Schema({ _id: false })
export class StudentProfile {
  @Prop({ default: null })
  career: string;

  @Prop({ default: null })
  studentCode: string;

  @Prop({ default: null })
  birthDate: Date;

  @Prop({ type: [String], default: [] })
  interests: string[];
}

/**
 * TeacherProfile — datos específicos del tutor.
 */
@Schema({ _id: false })
export class TeacherProfile {
  @Prop({ default: null })
  department: string;

  @Prop({ default: null })
  bio: string;

  @Prop({ type: [String], default: [] })
  subjects: string[];

  @Prop({ type: [String], default: [] })
  certifications: string[];

  @Prop({ default: null })
  hourlyRate: number;

  @Prop({ default: null })
  experienceYears: number;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: null })
  rating: number; // promedio cacheado

  @Prop({ default: 0 })
  ratingCount: number;
}

/**
 * InstitutionProfile — datos cuando el usuario actúa por una institución.
 * (Universidades, academias, colegios). Solo aplica a usuarios con permisos
 * institucionales (admin de institución).
 */
@Schema({ _id: false })
export class InstitutionProfile {
  @Prop({ default: null })
  institutionName: string;

  @Prop({ default: null })
  institutionCode: string;

  @Prop({ default: null })
  website: string;
}

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

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop({ default: null })
  emailVerificationToken: string;

  @Prop({ default: null })
  passwordResetToken: string;

  @Prop({ default: null })
  passwordResetExpiresAt: Date;

  @Prop({ required: false, default: null })
  phone: string;

  @Prop({ default: null })
  avatarUrl: string;

  // Perfiles por rol (subdocumentos opcionales)
  @Prop({ type: StudentProfile, default: () => ({}) })
  studentProfile: StudentProfile;

  @Prop({ type: TeacherProfile, default: () => ({}) })
  teacherProfile: TeacherProfile;

  @Prop({ type: InstitutionProfile, default: () => ({}) })
  institutionProfile: InstitutionProfile;

  // ── Legacy fields (mantener temporalmente para compatibilidad con datos viejos) ──
  // Estos campos quedan al nivel raíz porque los datos existentes los tienen.
  // Cuando se ejecute un migrate, se mueven a studentProfile/teacherProfile.
  @Prop({ default: null })
  department: string;

  @Prop({ default: null })
  career: string;

  @Prop({ default: null })
  studentCode: string;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);

UserSchema.index({ email: 1 });
UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ 'teacherProfile.subjects': 1 });
UserSchema.index({ passwordResetToken: 1 });
