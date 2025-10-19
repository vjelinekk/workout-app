import { BaseResponseDto } from 'src/common/dtos/base-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class WorkoutSessionPlanResponseDto extends BaseResponseDto {
    @ApiProperty({
        example: 'Upper Body Strength Training',
        description: 'The name of the workout session plan',
    })
    @IsString()
    @Expose()
    name: string;

    @ApiProperty({
        example:
            'A comprehensive upper body workout focusing on strength building',
        description: 'A detailed description of the workout session plan',
    })
    @IsString()
    @Expose()
    description: string;

    @ApiProperty({
        example: 1,
        description: 'The ID of the user who created this workout session plan',
    })
    @IsNumber()
    @Expose()
    createdBy: number;

    @ApiProperty({
        example: true,
        description: 'Whether the workout session plan is publicly available',
    })
    @IsBoolean()
    @Expose()
    isPublic: boolean;

    @ApiProperty({
        example: true,
        description:
            'Whether the workout session plan is approved to show publicly',
    })
    @IsBoolean()
    @Expose()
    isApproved: boolean;
}
