import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

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
}
