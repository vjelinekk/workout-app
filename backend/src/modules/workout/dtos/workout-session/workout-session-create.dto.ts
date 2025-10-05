import { ApiProperty } from '@nestjs/swagger';
import {
    IsInt,
    IsNotEmpty,
    IsOptional,
} from 'class-validator';

export class WorkoutSessionCreateDto {
    @ApiProperty({
        example: 1,
        description: 'The ID of the workout session plan',
    })
    @IsInt()
    @IsNotEmpty()
    workout_session_plan_id: number;

    @ApiProperty({
        example: 1,
        description: 'The ID of the training split (optional)',
        required: false,
    })
    @IsInt()
    @IsOptional()
    training_split_id?: number;
}
