import { BaseResponseDto } from 'src/common/dtos/base-response.dto';

export class WorkoutSessionPlanExerciseResponseDto extends BaseResponseDto {
    workout_session_plan_id: number;
    exercise_id: number;
    order: number;
    planned_sets: number;
    planned_reps_per_set: number[];
}
