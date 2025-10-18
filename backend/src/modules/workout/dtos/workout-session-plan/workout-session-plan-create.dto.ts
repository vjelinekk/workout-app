import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class WorkoutSessionPlanCreateDto {
    @ApiProperty({
        example: 'Upper Body Strength Training',
        description: 'The name of the workout session plan',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        example:
            'A comprehensive upper body workout focusing on strength building',
        description: 'A detailed description of the workout session plan',
    })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({
        example: 'true',
        description: 'Is exercise publicly available',
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    is_public?: boolean;

    @ApiProperty({
        example: 'true',
        description: 'Is exercise approved to show publicly',
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    is_approved?: boolean;
}
