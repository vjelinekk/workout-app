import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsOptional } from 'class-validator';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';
import { TrainingSplitAssignmentStatusEnum } from '../../enums/training-split-assignment-status.enum';

export class TrainingSplitAssignmentResponseDto extends BaseResponseDto {
    @ApiProperty({
        example: 1,
        description: 'The ID of the trainee user',
    })
    @IsInt()
    trainee_id: number;

    @ApiProperty({
        example: 1,
        description: 'The ID of the training split',
    })
    @IsInt()
    training_split_id: number;

    @ApiProperty({
        example: 1,
        description: 'The ID of the user who assigned this training split',
        nullable: true,
    })
    @IsInt()
    @IsOptional()
    assigned_by_id?: number;

    @ApiProperty({
        example: TrainingSplitAssignmentStatusEnum.PENDING,
        description: 'The status of the assignment',
        enum: TrainingSplitAssignmentStatusEnum,
    })
    @IsEnum(TrainingSplitAssignmentStatusEnum)
    status: TrainingSplitAssignmentStatusEnum;

    @ApiProperty({
        example: '2025-10-05T14:30:00.000Z',
        description: 'Timestamp when the training split was assigned',
    })
    @IsDateString()
    assigned_at: string;

    @ApiProperty({
        example: '2025-10-05T15:00:00.000Z',
        description: 'Timestamp when the trainee responded to the assignment',
        nullable: true,
    })
    @IsDateString()
    @IsOptional()
    responded_at?: string;

    @ApiProperty({
        example: 1,
        description: 'ID of the user who created the assignment',
    })
    @IsInt()
    created_by: number;
}
