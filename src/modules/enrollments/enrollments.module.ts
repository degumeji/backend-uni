import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { ClassesModule } from '../classes/classes.module';
import { EnrollmentModel, EnrollmentSchema } from './infrastructure/schemas/enrollment.schema';
import { EnrollmentsService } from './application/use-cases/enrollments.service';
import { EnrollmentsController } from './presentation/enrollments.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EnrollmentModel.name, schema: EnrollmentSchema },
    ]),
    AuthModule,
    forwardRef(() => ClassesModule),
  ],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}
