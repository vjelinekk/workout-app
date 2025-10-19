import { ApiProperty } from '@nestjs/swagger';
import { WorkoutSessionResponseDto } from './workout-session-response.dto';
import { Expose, Type } from 'class-transformer';

export class WorkoutSessionStartDto {
    @ApiProperty({
        description: 'Previous workout session if exists',
        nullable: true,
        type: () => WorkoutSessionResponseDto,
    })
    @Expose()
    @Type(() => WorkoutSessionResponseDto)
    previousWorkoutSession: WorkoutSessionResponseDto | null;

    @ApiProperty({ description: 'Current workout session', nullable: false })
    @Expose()
    @Type(() => WorkoutSessionResponseDto)
    currentWorkoutSession: WorkoutSessionResponseDto;
}
