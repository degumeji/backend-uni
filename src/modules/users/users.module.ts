import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersService } from './application/use-cases/users.service';
import { UsersController } from './presentation/users.controller';
import { ClassesModule } from '../classes/classes.module';
import { EnrollmentsModule } from '../enrollments/enrollments.module';

@Module({
  imports: [
    AuthModule,
    forwardRef(() => ClassesModule),
    forwardRef(() => EnrollmentsModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
