import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsOptional } from 'class-validator';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';
import { TrainingSplitAssignmentStatusEnum } from '../../enums/training-split-assignment-status.enum';
import { Expose } from 'class-transformer';

export class TrainingSplitAssignmentResponseDto extends BaseResponseDto {
    @ApiProperty({
        example: 1,
        description: 'The ID of the trainee user',
    })
    @IsInt()
    @Expose()
    traineeId: number;

    @ApiProperty({
        example: 1,
        description: 'The ID of the training split',
    })
    @IsInt()
    @Expose()
    trainingSplitId: number;

    @ApiProperty({
        example: 1,
        description: 'The ID of the user who assigned this training split',
        nullable: true,
    })
    @IsInt()
    @IsOptional()
    @Expose()
    assignedById?: number;

    @ApiProperty({
        example: TrainingSplitAssignmentStatusEnum.PENDING,
        description: 'The status of the assignment',
        enum: TrainingSplitAssignmentStatusEnum,
    })
    @IsEnum(TrainingSplitAssignmentStatusEnum)
    @Expose()
    status: TrainingSplitAssignmentStatusEnum;

    @ApiProperty({
        example: '2025-10-05T14:30:00.000Z',
        description: 'Timestamp when the training split was assigned',
    })
    @IsDateString()
    @Expose()
    assignedAt: string;

    @ApiProperty({
        example: '2025-10-05T15:00:00.000Z',
        description: 'Timestamp when the trainee responded to the assignment',
        nullable: true,
    })
    @IsDateString()
    @IsOptional()
    @Expose()
    respondedAt?: string;

    @ApiProperty({
        example: 1,
        description: 'ID of the user who created the assignment',
    })
    @IsInt()
    @Expose()
    createdBy: number;
}
