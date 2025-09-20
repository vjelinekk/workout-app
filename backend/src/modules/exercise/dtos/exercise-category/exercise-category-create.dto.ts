import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ExerciseCategoryCreateDto {
    @ApiProperty({
        example: 'Category',
        description: 'The name of the category',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        example: 'Description',
        description: 'The description of category',
    })
    @IsString()
    @IsNotEmpty()
    description: string;
}
