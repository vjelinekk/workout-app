import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min, IsOptional, IsNotEmpty } from 'class-validator';

export class WorkoutSessionSetProgressDto {
    @ApiProperty({ description: 'Number of repetitions', example: 10 })
    @IsNotEmpty()
    @Type(() => Number)
    @IsInt()
    @Min(1, { message: 'Reps must be a positive integer (minimum 1)' })
    reps: number;

    @ApiProperty({ description: 'Weight used', example: 50, nullable: true })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    weight: number | null;
}
