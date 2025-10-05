import { ApiProperty } from '@nestjs/swagger';
import {
    IsDateString,
    IsEnum,
    IsInt,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';
import { WorkoutSessionStatusEnum } from '../../enums/workout-session-status.enum';

export class WorkoutSessionResponseDto extends BaseResponseDto {
    @ApiProperty({
        example: 1,
        description: 'The ID of the user who performed the workout',
    })
    @IsInt()
    performed_by_id: number;

    @ApiProperty({
        example: 1,
        description: 'The ID of the workout session plan',
    })
    @IsInt()
    workout_session_plan_id: number;

    @ApiProperty({
        example: 1,
        description: 'The ID of the training split',
        nullable: true,
    })
    @IsInt()
    @IsOptional()
    training_split_id?: number;

    @ApiProperty({
        example: WorkoutSessionStatusEnum.IN_PROGRESS,
        description: 'Status of the workout session',
        enum: WorkoutSessionStatusEnum,
    })
    @IsEnum(WorkoutSessionStatusEnum)
    status: WorkoutSessionStatusEnum;

    @ApiProperty({
        example: '2025-10-05T14:30:00.000Z',
        description: 'Timestamp when the workout session was started',
        nullable: true,
    })
    @IsDateString()
    @IsOptional()
    started_at?: string;

    @ApiProperty({
        example: '2025-10-05T16:00:00.000Z',
        description: 'Timestamp when the workout session was finished',
        nullable: true,
    })
    @IsDateString()
    @IsOptional()
    finished_at?: string;

    @ApiProperty({
        example: 'Great workout today!',
        description: 'Notes about the workout session',
        nullable: true,
    })
    @IsString()
    @IsOptional()
    notes?: string;

    @ApiProperty({
        example: 5400,
        description: 'Duration of the workout session in seconds',
        nullable: true,
    })
    @IsNumber()
    @IsOptional()
    duration_seconds?: number;

    @ApiProperty({
        example: 1,
        description: 'ID of the user who created the workout session',
    })
    @IsInt()
    created_by: number;
}
