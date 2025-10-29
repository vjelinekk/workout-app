import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
    IsEmail,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';
import { RoleEnum } from '../enums/role.enum';

export class UserResponseDto {
    @ApiProperty({
        description: 'Unique identifier of the user',
        example: 1,
    })
    @IsNumber()
    @IsNotEmpty()
    @Expose()
    id: number;

    @ApiProperty({
        description: 'First name of the user',
        example: 'John',
    })
    @IsString()
    @IsNotEmpty()
    @Expose()
    firstName: string;

    @ApiProperty({
        description: 'Last name of the user',
        example: 'Doe',
    })
    @IsString()
    @IsNotEmpty()
    @Expose()
    lastName: string;

    @ApiProperty({
        description: 'Nickname of the user',
        example: 'johndoe',
    })
    @IsString()
    @IsNotEmpty()
    @Expose()
    nickname: string;

    @ApiProperty({
        description: 'Email address of the user',
        example: 'john.doe@example.com',
    })
    @IsEmail()
    @IsNotEmpty()
    @Expose()
    email: string;

    @ApiProperty({
        description: 'Reason for wanting to become a trainer',
        example: 'I want to help others achieve their fitness goals',
    })
    @IsOptional()
    @IsString()
    @Expose()
    becomeTrainerReason?: string;

    @ApiProperty({
        example: [1, 2],
        description: 'Roles of the user',
    })
    @IsNumber({}, { each: true })
    @Expose()
    roles: RoleEnum[];
}
