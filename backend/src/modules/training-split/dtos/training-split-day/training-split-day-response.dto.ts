import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsInt } from 'class-validator';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';
import { WorkoutSessionPlanResponseDto } from 'src/modules/workout/dtos/workout-session-plan/workout-session-plan-response.dto';

export class TrainingSplitDayResponseDto extends BaseResponseDto {
    @ApiProperty({
        example: 1,
        description: 'The ID of the training split',
    })
    @IsInt()
    @Expose()
    trainingSplitId: number;

    @ApiProperty({
        example: 1,
        description: 'The ID of the workout session plan',
    })
    @IsInt()
    @Expose()
    workoutSessionPlanId: number;

    @ApiProperty({
        type: WorkoutSessionPlanResponseDto,
        description: 'The workout session plan associated with this day',
    })
    @Expose()
    @Type(() => WorkoutSessionPlanResponseDto)
    workoutSessionPlan: WorkoutSessionPlanResponseDto;

    @ApiProperty({
        example: 1,
        description: 'Day of the week (1=Monday, 7=Sunday)',
        minimum: 1,
        maximum: 7,
    })
    @IsInt()
    @Expose()
    dayOfWeek: number;

    @ApiProperty({
        example: 1,
        description: 'Order of the workout session plan in the day',
    })
    @IsInt()
    @Expose()
    order: number;

    @ApiProperty({
        example: 1,
        description: 'ID of the user who created the training split day',
    })
    @IsInt()
    @Expose()
    createdBy: number;
}
