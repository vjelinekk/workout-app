import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class WorkoutSessionCreateDto {
    @ApiProperty({ description: 'ID of the workout session plan', example: 1 })
    @IsNumber()
    @IsNotEmpty()
    workoutSessionPlanId: number;

    @ApiProperty({ description: 'ID of the training split', example: 1 })
    @IsNumber()
    @IsNotEmpty()
    trainingSplitId: number;
}
