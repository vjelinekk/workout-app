import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutSessionEntity } from './entities/workout-session.entity';
import { WorkoutSessionExerciseEntity } from './entities/workout-session-exercise.entity';
import { WorkoutSessionPlanEntity } from './entities/workout-session-plan.entity';
import { WorkoutSessionPlanExerciseEntity } from './entities/workout-session-plan-exercise.entity';
import { WorkoutSessionPlanController } from './controllers/workout-session-plan.controller';
import { WorkoutSessionPlanExerciseController } from './controllers/workout-session-plan-exercise.controller';
import { WorkoutSessionPlanRepository } from './repositories/workout-session-plan.repository';
import { WorkoutSessionPlanExerciseRepository } from './repositories/workout-session-plan-exercise.respository';
import { WorkoutSessionPlanService } from './services/workout-session-plan.service';
import { WorkoutSessionPlanExerciseService } from './services/workout-session-plan-exercise.service';
import { WorkoutSessionController } from './controllers/workout-session.controller';
import { WorkoutSessionRepository } from './repositories/workout-session.respository';
import { WorkoutSessionService } from './services/workout-session.service';
import { WorkoutSessionExerciseRepository } from './repositories/workout-session-exercise.respository';

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
        WorkoutSessionController,
    ],
    providers: [
        WorkoutSessionPlanRepository,
        WorkoutSessionPlanService,
        WorkoutSessionPlanExerciseRepository,
        WorkoutSessionPlanExerciseService,
        WorkoutSessionRepository,
        WorkoutSessionService,
        WorkoutSessionExerciseRepository,
    ],
    exports: [WorkoutSessionPlanRepository],
})
export class WorkoutModule {}
