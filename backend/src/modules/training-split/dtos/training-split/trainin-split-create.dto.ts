import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TrainingSplitCreateDto {
    @ApiProperty({
        example: 'Push Pull Legs',
        description: 'The name of the training split',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        example:
            'A 3-day training split focusing on push, pull, and leg movements',
        description: 'A brief description of the training split',
    })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({
        example: 'true',
        description: 'Is training split publicly available',
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    isPublic?: boolean;

    @ApiProperty({
        example: 'true',
        description: 'Is training split approved to show publicly',
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    isApproved?: boolean;
}
