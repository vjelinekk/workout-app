import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { RoleEnum } from 'src/modules/user/enums/role.enum';

export class LoginResponseDto {
    @ApiProperty({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description: 'JWT access token',
    })
    @IsString()
    access_token: string;

    @ApiProperty({ example: 1, description: 'ID of the user' })
    @IsNumber()
    user_id: number;

    @ApiProperty({ example: 'John', description: 'First name of the user' })
    @IsString()
    user_first_name: string;

    @ApiProperty({ example: 'Doe', description: 'Last name of the user' })
    @IsString()
    user_last_name: string;

    @ApiProperty({ example: 'johndoe', description: 'Nickname of the user' })
    @IsString()
    user_nickname: string;

    @ApiProperty({ example: 'johndoe@example.com', description: 'Email of the user' })
    @IsString()
    user_email: string;

    @ApiProperty({ example: ['user', 'admin'], description: 'Roles of the user' })
    @IsString({ each: true })
    roles: RoleEnum[];
}
