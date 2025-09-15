import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExerciseEntity } from './entities/exercise.entity';
import { ExerciseCategoryEntity } from './entities/exercise-category.entity';
import { ExerciseController } from './controllers/exercise.controller';
import { ExerciseService } from './services/exercise.service';
import { ExerciseRepository } from './repositories/exercise.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([ExerciseEntity, ExerciseCategoryEntity]),
    ],
    controllers: [ExerciseController],
    exports: [],
    providers: [ExerciseService, ExerciseRepository],
})
export class ExerciseModule {}
