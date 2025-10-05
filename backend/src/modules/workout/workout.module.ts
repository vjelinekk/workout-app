import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutSessionEntity } from './entities/workout-session.entity';
import { WorkoutSessionExerciseEntity } from './entities/workout-session-exercise.entity';
import { WorkoutSessionPlanEntity } from './entities/workout-session-plan.entity';
import { WorkoutSessionPlanExerciseEntity } from './entities/workout-session-plan-exercise.entity';
import { WorkoutSessionPlanController } from './controllers/workout-session-plan.controller';
import { WorkoutSessionPlanRepository } from './repositories/workout-session-plan.repository';
import { WorkoutSessionPlanService } from './services/workout-session-plan.service';
import { WorkoutSessionPlanExerciseController } from './controllers/workout-session-plan-exercise.controller';
import { WorkoutSessionPlanExerciseRepository } from './repositories/workout-session-plan-exercise.respository';
import { WorkoutSessionPlanExerciseService } from './services/workout-session-plan-exercise.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            WorkoutSessionEntity,
            WorkoutSessionExerciseEntity,
            WorkoutSessionPlanEntity,
            WorkoutSessionPlanExerciseEntity,
        ]),
    ],
    controllers: [
        WorkoutSessionPlanController,
        WorkoutSessionPlanExerciseController,
    ],
    providers: [
        WorkoutSessionPlanRepository,
        WorkoutSessionPlanService,
        WorkoutSessionPlanExerciseRepository,
        WorkoutSessionPlanExerciseService,
    ],
    exports: [
        WorkoutSessionPlanRepository,
    ],
})
export class WorkoutModule {}
