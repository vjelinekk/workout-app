import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';

export class WorkoutSessionPlanExerciseResponseDto extends BaseResponseDto {
    @ApiProperty({ example: 1, description: 'ID of the workout session plan' })
    @IsNumber()
    workout_session_plan_id: number;

    @ApiProperty({ example: 1, description: 'ID of the exercise' })
    @IsNumber()
    exercise_id: number;

    @ApiProperty({
        example: 1,
        description: 'Order of the exercise in the plan',
    })
    @IsNumber()
    order: number;

    @ApiProperty({
        example: 3,
        description: 'Number of sets planned for the exercise',
    })
    @IsNumber()
    planned_sets: number;

    @ApiProperty({
        example: [10, 12, 15],
        description: 'Number of reps planned per set',
    })
    planned_reps_per_set: number[];
}
