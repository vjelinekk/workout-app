import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';
import { TrainingSplitDayResponseDto } from '../training-split-day/training-split-day-response.dto';

export class TrainingSplitResponseDto extends BaseResponseDto {
    @ApiProperty({
        example: 'Push Pull Legs',
        description: 'The name of the training split',
    })
    @IsString()
    @Expose()
    name: string;

    @ApiProperty({
        example:
            'A 3-day training split focusing on push, pull, and leg movements',
        description: 'A brief description of the training split',
    })
    @IsString()
    @Expose()
    description: string;

    @ApiProperty({
        example: 'true',
        description: 'Is training split publicly available',
    })
    @IsBoolean()
    @Expose()
    isPublic: boolean;

    @ApiProperty({
        example: 'true',
        description: 'Is training split approved to show publicly',
    })
    @IsBoolean()
    @Expose()
    isApproved: boolean;

    @ApiProperty({
        example: '1',
        description: 'ID of the user who created the training split',
    })
    @IsNumber()
    @Expose()
    createdBy: number;

    @ApiProperty({
        type: [TrainingSplitDayResponseDto],
        description: 'The days associated with the training split',
    })
    @IsOptional()
    @Expose()
    @Type(() => TrainingSplitDayResponseDto)
    days?: TrainingSplitDayResponseDto[];
}
