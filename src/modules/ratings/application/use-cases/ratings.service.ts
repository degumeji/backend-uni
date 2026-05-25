import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { RatingRepositoryPort, RATING_REPOSITORY_PORT } from '../../domain/ports/rating.repository.port';
import { Rating } from '../../domain/entities/rating.entity';
import { CreateRatingDto } from '../../presentation/dtos/create-rating.dto';

@Injectable()
export class RatingsService {
  constructor(
    @Inject(RATING_REPOSITORY_PORT)
    private readonly ratingRepository: RatingRepositoryPort,
  ) {}

  async createRating(studentId: string, dto: CreateRatingDto): Promise<Rating> {
    // 1. Verificamos si ya existe una calificación de este estudiante para esta clase
    const hasRated = await this.ratingRepository.hasStudentRatedClass(studentId, dto.classId);
    if (hasRated) {
      throw new ConflictException('Ya has enviado una calificación para esta clase.');
    }

    // TODO: En un futuro puedes inyectar EnrollmentsService aquí para validar que el alumno SÍ tomó la clase.

    // 2. Creamos la entidad usando las reglas de dominio
    const rating = Rating.create(studentId, dto.teacherId, dto.classId, dto.score, dto.comment);
    return this.ratingRepository.save(rating);
  }

  async getTeacherStats(teacherId: string) {
    const ratings = await this.ratingRepository.findByTeacherId(teacherId);
    const average = await this.ratingRepository.getAverageScoreByTeacher(teacherId);
    return { average, totalReviews: ratings.length, reviews: ratings };
  }
}
