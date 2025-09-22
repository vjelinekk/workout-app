import { BaseResponseDto } from 'src/common/dtos/base-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class WorkoutSessionPlanResponseDto extends BaseResponseDto {
    @ApiProperty({
        example: 'Upper Body Strength Training',
        description: 'The name of the workout session plan',
    })
    @IsString()
    name: string;

    @ApiProperty({
        example:
            'A comprehensive upper body workout focusing on strength building',
        description: 'A detailed description of the workout session plan',
    })
    @IsString()
    description: string;

    @ApiProperty({
        example: 1,
        description: 'The ID of the user who created this workout session plan',
    })
    @IsNumber()
    created_by: number;

    @ApiProperty({
        example: true,
        description: 'Whether the workout session plan is publicly available',
    })
    @IsBoolean()
    is_public: boolean;

    @ApiProperty({
        example: true,
        description:
            'Whether the workout session plan is approved to show publicly',
    })
    @IsBoolean()
    is_approved: boolean;
}
