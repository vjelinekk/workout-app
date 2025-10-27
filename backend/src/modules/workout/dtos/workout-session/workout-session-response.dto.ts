import { BaseResponseDto } from 'src/common/dtos/base-response.dto';
import { WorkoutSessionPlanResponseDto } from '../workout-session-plan/workout-session-plan-response.dto';
import { TrainingSplitResponseDto } from 'src/modules/training-split/dtos/training-split/training-split-response.dto';
import { WorkoutSessionStatusEnum } from '../../enums/workout-session-status.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { WorkoutSessionExerciseShallowResponseDto } from '../workout-session-exercise/workout-session-exercise-shallow-response.dto';

export class WorkoutSessionResponseDto extends BaseResponseDto {
    @ApiProperty({
        description: 'ID of the user who performed the workout session',
        example: 1,
    })
    @IsNumber()
    @IsNotEmpty()
    @Expose()
    performedById: number;

    @ApiProperty({ description: 'Workout session plan details' })
    @IsOptional()
    @Expose()
    @Type(() => WorkoutSessionPlanResponseDto)
    workoutSessionPlan?: WorkoutSessionPlanResponseDto;

    @ApiProperty({
        description: 'ID of the workout session plan',
        example: 1,
    })
    @IsNumber()
    @IsNotEmpty()
    @Expose()
    workoutSessionPlanId: number;

    @ApiProperty({ description: 'Training split details' })
    @IsOptional()
    @Expose()
    @Type(() => TrainingSplitResponseDto)
    trainingSplit?: TrainingSplitResponseDto;

    @ApiProperty({
        description: 'ID of the training split',
        example: 1,
    })
    @IsOptional()
    @IsNumber()
    @Expose()
    trainingSplitId?: number;

    @ApiProperty({
        description: 'Status of the workout session',
        example: WorkoutSessionStatusEnum.IN_PROGRESS,
    })
    @IsNotEmpty()
    @Expose()
    status: WorkoutSessionStatusEnum;

    @ApiProperty({
        description: 'Start time of the workout session',
        example: '2024-01-01T10:00:00Z',
    })
    @IsOptional()
    @Expose()
    startedAt?: Date;

    @ApiProperty({
        description: 'End time of the workout session',
        example: '2024-01-01T11:00:00Z',
    })
    @IsOptional()
    @Expose()
    finishedAt?: Date;

    @ApiProperty({
        description: 'Notes for the workout session',
        example: 'Felt great today!',
    })
    @IsOptional()
    @Expose()
    notes?: string;

    @ApiProperty({
        description: 'Duration of the workout session in seconds',
        example: 3600,
    })
    @IsOptional()
    @IsNumber()
    @Expose()
    durationSeconds?: number;

    @ApiProperty({
        description: 'Exercises performed in the workout session',
        type: [WorkoutSessionExerciseShallowResponseDto],
    })
    @Expose()
    @Type(() => WorkoutSessionExerciseShallowResponseDto)
    exercises: WorkoutSessionExerciseShallowResponseDto[];
}
