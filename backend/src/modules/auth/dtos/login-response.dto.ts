import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

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
}
