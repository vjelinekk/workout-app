import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { BaseResponseDto } from "src/common/dtos/base-response.dto";

export class TrainingSplitResponseDto extends BaseResponseDto {
    @ApiProperty({
        example: 'Push Pull Legs',
        description: 'The name of the training split',
    })
    @IsString()
    name: string;

    @ApiProperty({
        example: 'A 3-day training split focusing on push, pull, and leg movements',
        description: 'A brief description of the training split',
    })
    @IsString()
    description: string;

    @ApiProperty({
        example: 'true',
        description: 'Is training split publicly available',
    })
    @IsBoolean()
    is_public: boolean;

    @ApiProperty({
        example: 'true',
        description: 'Is training split approved to show publicly',
    })
    @IsBoolean()
    is_approved: boolean;

    @ApiProperty({
        example: '1',
        description: 'ID of the user who created the training split',
    })
    @IsNumber()
    created_by: number;
}