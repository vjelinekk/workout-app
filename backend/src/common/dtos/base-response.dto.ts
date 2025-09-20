import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber } from 'class-validator';

export abstract class BaseResponseDto {
    @ApiProperty({
        example: '1',
        description: 'Unique identifier of the resource',
    })
    @IsNumber()
    id: number;

    @ApiProperty({
        example: 'true',
        description: 'When was the exercise created',
    })
    @IsDate()
    created_at: Date;

    @ApiProperty({
        example: 'true',
        description: 'When was the exercise last updated',
    })
    @IsDate()
    updated_at: Date;
}
