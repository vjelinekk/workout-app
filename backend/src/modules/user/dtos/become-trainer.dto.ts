import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class BecomeTrainerDto {
    @ApiProperty({
        description: 'Message from the user requesting to become a trainer',
        example:
            'I would like to become a trainer because I love helping others achieve their fitness goals.',
    })
    @IsString()
    @MinLength(10)
    @MaxLength(1000)
    @IsNotEmpty()
    reason: string;
}
