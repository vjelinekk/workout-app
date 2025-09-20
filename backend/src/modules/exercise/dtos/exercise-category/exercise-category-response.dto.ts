import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';

export class ExerciseCategoryResponseDto extends BaseResponseDto {
    @ApiProperty({
        example: 'Category',
        description: 'Name of the category',
    })
    @IsString()
    name: string;

    @ApiProperty({
        example: 'Description ...',
        description: 'Description of the category',
    })
    @IsString()
    description: string;
}
