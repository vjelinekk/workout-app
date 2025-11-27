import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExerciseEntity } from './entities/exercise.entity';
import { ExerciseCategoryEntity } from './entities/exercise-category.entity';
import { ExerciseController } from './controllers/exercise.controller';
import { ExerciseService } from './services/exercise.service';
import { ExerciseRepository } from './repositories/exercise.repository';
import { ExerciseCategoryController } from './controllers/exercise-category.controller';
import { ExerciseCategoryService } from './services/exercise-category.service';
import { ExerciseCategoryRepository } from './repositories/exercise-category.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([ExerciseEntity, ExerciseCategoryEntity]),
    ],
    controllers: [ExerciseController, ExerciseCategoryController],
    exports: [ExerciseService],
    providers: [
        ExerciseService,
        ExerciseCategoryService,
        ExerciseRepository,
        ExerciseCategoryRepository,
    ],
})
export class ExerciseModule {}
