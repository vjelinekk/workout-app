import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, Max, Min } from 'class-validator';

export class TrainingSplitDayCreateDto {
    @ApiProperty({
        example: 1,
        description: 'The ID of the training split',
    })
    @IsInt()
    @IsNotEmpty()
    training_split_id: number;

    @ApiProperty({
        example: 1,
        description: 'The ID of the workout session plan',
    })
    @IsInt()
    @IsNotEmpty()
    workout_session_plan_id: number;

    @ApiProperty({
        example: 1,
        description: 'Day of the week (1=Monday, 7=Sunday)',
        minimum: 1,
        maximum: 7,
    })
    @IsInt()
    @Min(1)
    @Max(7)
    @IsNotEmpty()
    day_of_week: number;

    @ApiProperty({
        example: 1,
        description: 'Order of the workout session plan in the day',
        required: false,
    })
    @IsInt()
    @IsOptional()
    order?: number;
}
