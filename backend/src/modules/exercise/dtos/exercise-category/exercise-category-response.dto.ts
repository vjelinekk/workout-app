import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';

export class ExerciseCategoryResponseDto extends BaseResponseDto {
    @ApiProperty({
        example: 'Category',
        description: 'Name of the category',
    })
    @IsString()
    @Expose()
    name: string;

    @ApiProperty({
        example: 'Description ...',
        description: 'Description of the category',
    })
    @IsString()
    @Expose()
    description: string;
}
