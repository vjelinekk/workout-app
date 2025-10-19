import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsInt } from 'class-validator';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';

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
