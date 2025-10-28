import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class RegisterDto {
    @ApiProperty({ example: 'John' })
    @IsNotEmpty()
    @IsString()
    @Length(2, 30)
    firstName: string;

    @ApiProperty({ example: 'Doe' })
    @IsNotEmpty()
    @IsString()
    @Length(2, 30)
    lastName: string;

    @ApiProperty({ example: 'JohnnyD' })
    @IsNotEmpty()
    @IsString()
    @Length(3, 20)
    nickname: string;

    @ApiProperty({ example: 'johnnyd@example.com' })
    @IsNotEmpty()
    @IsString()
    @Length(5, 100)
    email: string;

    @ApiProperty({ example: 'P@ssw0rd' })
    @IsNotEmpty()
    @IsString()
    @Length(6, 100)
    password: string;
}
