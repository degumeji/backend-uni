import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RatingModel, RatingSchema } from './infrastructure/schemas/rating.schema';
import { RatingsController } from './presentation/ratings.controller';
import { RatingsService } from './application/use-cases/ratings.service';
import { RATING_REPOSITORY_PORT } from './domain/ports/rating.repository.port';
import { MongoRatingRepository } from './infrastructure/adapters/mongo-rating.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: RatingModel.name, schema: RatingSchema }])],
  controllers: [RatingsController],
  providers: [
    RatingsService,
    { provide: RATING_REPOSITORY_PORT, useClass: MongoRatingRepository },
  ],
  exports: [RatingsService],
})
export class RatingsModule {}