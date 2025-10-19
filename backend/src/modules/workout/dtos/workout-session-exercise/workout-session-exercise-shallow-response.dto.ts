import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';
import { ExerciseResponseDto } from 'src/modules/exercise/dtos/exercise/exercise-response.dto';

export class WorkoutSessionExerciseShallowResponseDto extends BaseResponseDto {
    @ApiProperty({ description: 'ID of the workout session', example: 1 })
    @IsNumber()
    @Expose()
    workoutSessionId: number;

    @ApiProperty({ description: 'ID of the exercise', example: 1 })
    @IsNumber()
    @Expose()
    exerciseId: number;

    @ApiProperty({ description: 'Exercise details' })
    @Expose()
    @Type(() => ExerciseResponseDto)
    exercise: ExerciseResponseDto;

    @ApiProperty({
        description: 'Order of the exercise in the workout session',
        example: 1,
    })
    @IsNumber()
    @Expose()
    order: number;

    previousRepsPerSet: number[] | null;

    previousWeightPerSet: number[] | null;

    @ApiProperty({
        description: 'Actual reps performed per set',
        example: [10, 12, 8],
    })
    @Expose()
    actualRepsPerSet: (number | null)[];

    @ApiProperty({
        description: 'Actual weight lifted per set',
        example: [100, 110, 120],
    })
    @Expose()
    actualWeightPerSet: (number | null)[];

    @ApiProperty({
        description: 'Notes for the exercise',
        example: 'Felt great today!',
    })
    @Expose()
    notes?: string;
}
