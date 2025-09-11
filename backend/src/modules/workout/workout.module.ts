import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WorkoutSessionEntity } from "./entities/workout-session.entity";
import { WorkoutSessionExerciseEntity } from "./entities/workout-session-exercise.entity";
import { WorkoutSessionPlanEntity } from "./entities/workout-session-plan.entity";
import { WorkoutSessionPlanExerciseEntity } from "./entities/workout-session-plan-exercise.entity";

@Module({
    imports: [TypeOrmModule.forFeature([WorkoutSessionEntity, WorkoutSessionExerciseEntity, WorkoutSessionPlanEntity, WorkoutSessionPlanExerciseEntity])],
    controllers: [],
    providers: [],
    exports: [],
})
export class WorkoutModule {}