import { PartialType } from '@nestjs/swagger';
import { WorkoutSessionPlanExerciseCreateDto } from './workout-session-plan-exercise-create.dto';

export class WorkoutSessionPlanExercisePatchDto extends PartialType(
    WorkoutSessionPlanExerciseCreateDto,
) {}
