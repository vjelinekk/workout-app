import {
    IsArray,
    IsNotEmpty,
    IsNumber,
    IsPositive,
    Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WorkoutSessionPlanExerciseCreateDto {
    @ApiProperty({
        example: 1,
        description:
            'The ID of the workout session plan this exercise belongs to',
    })
    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    workout_session_plan_id: number;

    @ApiProperty({
        example: 5,
        description:
            'The ID of the exercise to be included in the workout plan',
    })
    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    exercise_id: number;

    @ApiProperty({
        example: 1,
        description: 'The order of this exercise in the workout session plan',
    })
    @IsNumber()
    @Min(1)
    @IsNotEmpty()
    order: number;

    @ApiProperty({
        example: 3,
        description: 'The number of sets planned for this exercise',
    })
    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    planned_sets: number;

    @ApiProperty({
        example: [8, 10, 12],
        description: 'The number of reps planned for each set',
        type: [Number],
    })
    @IsArray()
    @IsNumber({}, { each: true })
    @IsPositive({ each: true })
    @IsNotEmpty()
    planned_reps_per_set: number[];
}
