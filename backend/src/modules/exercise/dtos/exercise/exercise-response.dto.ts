import {
    IsBoolean,
    IsDate,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    IsUrl,
} from 'class-validator';
import { BodyPartEnum } from '../../enums/body-part.enum';
import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';

export class ExerciseResponseDto extends BaseResponseDto {
    @ApiProperty({
        example: 'Push Up',
        description: 'The name of the exercise',
    })
    @IsString()
    name: string;

    @ApiProperty({
        example: BodyPartEnum.CHEST,
        description: 'The primary body part targeted by the exercise',
    })
    @IsEnum(BodyPartEnum)
    body_part: BodyPartEnum;

    @ApiProperty({
        example: 'None',
        description: 'The equipment needed for the exercise',
    })
    @IsString()
    equipment: string;

    @ApiProperty({
        example: 'A basic upper body strength exercise',
        description: 'A brief description of the exercise',
    })
    @IsString()
    description: string;

    @ApiProperty({
        example: 1,
        description: 'The ID of the exercise category',
    })
    @IsNumber()
    @IsOptional()
    category_id?: number;

    @ApiProperty({
        example: 'https://example.com/image.jpg',
        description: 'The URL of an image demonstrating the exercise',
    })
    @IsString()
    @IsUrl()
    image_url: string;

    @ApiProperty({
        example: 'true',
        description: 'Is exercise publicly available',
    })
    @IsBoolean()
    is_public: boolean;

    @ApiProperty({
        example: 'true',
        description: 'Is exercise approved to show publicly',
    })
    @IsBoolean()
    is_approved: boolean;

    @ApiProperty({
        example: 'true',
        description: 'When was the exercise last updated',
    })
    @IsDate()
    created_by: number;
}
