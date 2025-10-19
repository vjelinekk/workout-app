import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsBoolean, IsDate, IsNumber } from 'class-validator';

export abstract class BaseResponseDto {
    @ApiProperty({
        example: '1',
        description: 'Unique identifier of the resource',
    })
    @IsNumber()
    @Expose()
    id: number;

    @ApiProperty({
        example: '2024-01-01T00:00:00.000Z',
        description: 'When was the exercise created',
    })
    @IsDate()
    @Expose()
    createdAt: Date;

    @ApiProperty({
        example: '2024-01-01T00:00:00.000Z',
        description: 'When was the exercise last updated',
    })
    @IsDate()
    @Expose()
    updatedAt: Date;

    @ApiProperty({
        example: 'false',
        description: 'Whether the resource is soft-deleted',
    })
    @IsBoolean()
    @Expose()
    isDeleted: boolean;
}
