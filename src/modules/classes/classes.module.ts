import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { ClassModel, ClassSchema } from './infrastructure/schemas/class.schema';
import { ClassesService } from './application/use-cases/classes.service';
import { ClassesController } from './presentation/classes.controller';
import { EnrollmentsModule } from '../enrollments/enrollments.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ClassModel.name, schema: ClassSchema }]),
    AuthModule,
    forwardRef(() => EnrollmentsModule),
  ],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService],
})
export class ClassesModule {}
