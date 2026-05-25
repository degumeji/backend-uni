import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RatingRepositoryPort } from '../../domain/ports/rating.repository.port';
import { Rating } from '../../domain/entities/rating.entity';
import { RatingDocument, RatingModel } from '../schemas/rating.schema';

@Injectable()
export class MongoRatingRepository implements RatingRepositoryPort {
  constructor(
    @InjectModel(RatingModel.name) private readonly ratingModel: Model<RatingDocument>,
  ) {}

  async save(rating: Rating): Promise<Rating> {
    const createdRating = new this.ratingModel(rating);
    const saved = await createdRating.save();
    return this.mapToDomain(saved);
  }

  async findByTeacherId(teacherId: string): Promise<Rating[]> {
    const ratings = await this.ratingModel.find({ teacherId }).sort({ createdAt: -1 }).exec();
    return ratings.map(this.mapToDomain);
  }

  async getAverageScoreByTeacher(teacherId: string): Promise<number> {
    const result = await this.ratingModel.aggregate([
      { $match: { teacherId: new Types.ObjectId(teacherId) } },
      { $group: { _id: null, average: { $avg: '$score' } } },
    ]);
    return result.length > 0 ? Number(result[0].average.toFixed(1)) : 0;
  }

  async hasStudentRatedClass(studentId: string, classId: string): Promise<boolean> {
    const count = await this.ratingModel.countDocuments({
      studentId: new Types.ObjectId(studentId),
      classId: new Types.ObjectId(classId),
    });
    return count > 0;
  }

  // Función de mapeo (Infraestructura -> Dominio)
  private mapToDomain(doc: RatingDocument): Rating {
    return new Rating(
      doc._id.toString(), doc.studentId.toString(), doc.teacherId.toString(),
      doc.classId.toString(), doc.score, doc.comment, doc.createdAt
    );
  }
}
