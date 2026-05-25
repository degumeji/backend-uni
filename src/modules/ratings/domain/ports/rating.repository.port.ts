import { Rating } from '../entities/rating.entity';

export interface RatingRepositoryPort {
  save(rating: Rating): Promise<Rating>;
  findByTeacherId(teacherId: string): Promise<Rating[]>;
  getAverageScoreByTeacher(teacherId: string): Promise<number>;
  hasStudentRatedClass(studentId: string, classId: string): Promise<boolean>;
}

// Símbolo usado para Inyección de Dependencias en NestJS
export const RATING_REPOSITORY_PORT = Symbol('RATING_REPOSITORY_PORT');
