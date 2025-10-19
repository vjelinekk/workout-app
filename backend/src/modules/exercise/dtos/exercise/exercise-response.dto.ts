import {
    IsBoolean,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    IsUrl,
} from 'class-validator';
import { BodyPartEnum } from '../../enums/body-part.enum';
import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';
import { Expose } from 'class-transformer';

export class ExerciseResponseDto extends BaseResponseDto {
    @ApiProperty({
        example: 'Push Up',
        description: 'The name of the exercise',
    })
    @IsString()
    @Expose()
    name: string;

    @ApiProperty({
        example: BodyPartEnum.CHEST,
        description: 'The primary body part targeted by the exercise',
    })
    @IsEnum(BodyPartEnum)
    @Expose()
    bodyPart: BodyPartEnum;

    @ApiProperty({
        example: 'None',
        description: 'The equipment needed for the exercise',
    })
    @IsString()
    @Expose()
    equipment: string;

    @ApiProperty({
        example: 'A basic upper body strength exercise',
        description: 'A brief description of the exercise',
    })
    @IsString()
    @Expose()
    description: string;

    @ApiProperty({
        example: 1,
        description: 'The ID of the exercise category',
    })
    @IsNumber()
    @IsOptional()
    @Expose()
    categoryId?: number;

    @ApiProperty({
        example: 'https://example.com/image.jpg',
        description: 'The URL of an image demonstrating the exercise',
    })
    @IsString()
    @IsUrl()
    @Expose()
    imageUrl: string;

    @ApiProperty({
        example: 'true',
        description: 'Is exercise publicly available',
    })
    @IsBoolean()
    @Expose()
    isPublic: boolean;

    @ApiProperty({
        example: 'true',
        description: 'Is exercise approved to show publicly',
    })
    @IsBoolean()
    @Expose()
    isApproved: boolean;

    @ApiProperty({
        example: '1',
        description: 'ID of the user who created the exercise',
    })
    @IsNumber()
    @Expose()
    createdBy: number;
}
