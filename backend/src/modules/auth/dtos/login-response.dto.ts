import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { RoleEnum } from 'src/modules/user/enums/role.enum';

export class LoginResponseDto {
    @ApiProperty({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description: 'JWT access token',
    })
    @IsString()
    accessToken: string;

    @ApiProperty({ example: 1, description: 'ID of the user' })
    @IsNumber()
    userId: number;

    @ApiProperty({ example: 'John', description: 'First name of the user' })
    @IsString()
    userFirstName: string;

    @ApiProperty({ example: 'Doe', description: 'Last name of the user' })
    @IsString()
    userLastName: string;

    @ApiProperty({ example: 'johndoe', description: 'Nickname of the user' })
    @IsString()
    userNickname: string;

    @ApiProperty({
        example: 'johndoe@example.com',
        description: 'Email of the user',
    })
    @IsString()
    userEmail: string;

    @ApiProperty({
        example: ['user', 'admin'],
        description: 'Roles of the user',
    })
    @IsString({ each: true })
    roles: RoleEnum[];
}
