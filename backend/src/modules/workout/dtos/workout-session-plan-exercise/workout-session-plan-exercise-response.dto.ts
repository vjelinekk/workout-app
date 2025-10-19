import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';
import { ExerciseResponseDto } from 'src/modules/exercise/dtos/exercise/exercise-response.dto';

export class WorkoutSessionPlanExerciseResponseDto extends BaseResponseDto {
    @ApiProperty({ example: 1, description: 'ID of the workout session plan' })
    @IsNumber()
    @Expose()
    workoutSessionPlanId: number;

    @ApiProperty({ example: 1, description: 'ID of the exercise' })
    @IsNumber()
    @Expose()
    exerciseId: number;

    @ApiProperty({
        type: ExerciseResponseDto,
        description: 'Details of the exercise',
    })
    @Expose()
    @Type(() => ExerciseResponseDto)
    exercise?: ExerciseResponseDto;

    @ApiProperty({
        example: 1,
        description: 'Order of the exercise in the plan',
    })
    @IsNumber()
    @Expose()
    order: number;

    @ApiProperty({
        example: 3,
        description: 'Number of sets planned for the exercise',
    })
    @IsNumber()
    @Expose()
    plannedSets: number;

    @ApiProperty({
        example: [10, 12, 15],
        description: 'Number of reps planned per set',
    })
    @Expose()
    plannedRepsPerSet: number[];
}
