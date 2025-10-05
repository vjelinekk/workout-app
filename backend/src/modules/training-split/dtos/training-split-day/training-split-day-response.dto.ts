import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';

export class TrainingSplitDayResponseDto extends BaseResponseDto {
    @ApiProperty({
        example: 1,
        description: 'The ID of the training split',
    })
    @IsInt()
    training_split_id: number;

    @ApiProperty({
        example: 1,
        description: 'The ID of the workout session plan',
    })
    @IsInt()
    workout_session_plan_id: number;

    @ApiProperty({
        example: 1,
        description: 'Day of the week (1=Monday, 7=Sunday)',
        minimum: 1,
        maximum: 7,
    })
    @IsInt()
    day_of_week: number;

    @ApiProperty({
        example: 1,
        description: 'Order of the workout session plan in the day',
    })
    @IsInt()
    order: number;

    @ApiProperty({
        example: 1,
        description: 'ID of the user who created the training split day',
    })
    @IsInt()
    created_by: number;
}
