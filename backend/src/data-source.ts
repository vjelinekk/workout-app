import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// Import UserEntity and dependencies FIRST to avoid circular dependency issues
// AuditableEntity depends on UserEntity, so it must be loaded before entities extending AuditableEntity
import { UserEntity } from './modules/user/entities/user.entity';
import { RoleEntity } from './modules/user/entities/role.entity';
import { TrainerTraineeEntity } from './modules/user/entities/trainer-trainee.entity';

// Import entities that extend AuditableEntity AFTER UserEntity
import { ExerciseCategoryEntity } from './modules/exercise/entities/exercise-category.entity';
import { ExerciseEntity } from './modules/exercise/entities/exercise.entity';
import { TrainingSplitEntity } from './modules/training-split/entities/training-split.entity';
import { TrainingSplitDayEntity } from './modules/training-split/entities/training-split-day.entity';
import { TrainingSplitAssignmentEntity } from './modules/training-split/entities/training-split-assignment.entity';
import { WorkoutSessionPlanEntity } from './modules/workout/entities/workout-session-plan.entity';
import { WorkoutSessionPlanExerciseEntity } from './modules/workout/entities/workout-session-plan-exercise.entity';
import { WorkoutSessionEntity } from './modules/workout/entities/workout-session.entity';
import { WorkoutSessionExerciseEntity } from './modules/workout/entities/workout-session-exercise.entity';

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: Number(process.env.POSTGRES_PORT) || 5432,
    username: process.env.POSTGRES_USER || 'workout',
    password: process.env.POSTGRES_PASSWORD || 'workout',
    database: process.env.POSTGRES_DB || 'workout_db',
    entities: [
        // User entities MUST load first (AuditableEntity depends on UserEntity)
        UserEntity,
        RoleEntity,
        TrainerTraineeEntity,

        // Domain entities (extend AuditableEntity, depend on UserEntity)
        ExerciseCategoryEntity,
        ExerciseEntity,
        TrainingSplitEntity,
        TrainingSplitDayEntity,
        TrainingSplitAssignmentEntity,
        WorkoutSessionPlanEntity,
        WorkoutSessionPlanExerciseEntity,
        WorkoutSessionEntity,
        WorkoutSessionExerciseEntity,
    ],
    migrations: ['src/migrations/*.{ts,js}'],
    synchronize: false,
    logging: true,
});
