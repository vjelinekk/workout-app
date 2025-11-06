import {
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUrl,
} from 'class-validator';
import { BodyPartEnum } from '../../enums/body-part.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ExerciseCreateDto {
    @ApiProperty({
        example: 'Push Up',
        description: 'The name of the exercise',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        example: BodyPartEnum.CHEST,
        description: 'The primary body part targeted by the exercise',
    })
    @IsEnum(BodyPartEnum)
    @IsNotEmpty()
    bodyPart: BodyPartEnum;

    @ApiProperty({
        example: 'None',
        description: 'The equipment needed for the exercise',
    })
    @IsString()
    @IsNotEmpty()
    equipment: string;

    @ApiProperty({
        example: 'A basic upper body strength exercise',
        description: 'A brief description of the exercise',
    })
    @IsString()
    @Expose()
    @IsNotEmpty()
    description: string;

    @ApiProperty({
        example: 1,
        description: 'The ID of the exercise category',
        required: false,
    })
    @IsNumber()
    @IsOptional()
    categoryId?: number;

    @ApiProperty({
        example: 'https://example.com/image.jpg',
        description: 'The URL of an image demonstrating the exercise',
        required: false,
    })
    @IsString()
    @IsOptional()
    imageUrl?: string;

    @ApiProperty({
        example: 'true',
        description: 'Is exercise publicly available',
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    isPublic?: boolean;

    @ApiProperty({
        example: 'true',
        description: 'Is exercise approved to show publicly',
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    isApproved?: boolean;
}
