import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class TrainerTraineeTraineeResponseDto {
    @ApiProperty({
        example: 1,
        description: 'The ID of the trainee user',
    })
    @IsNumber()
    @IsNotEmpty()
    id: number;

    @ApiProperty({
        example: 'John',
        description: 'The first name of the trainee user',
    })
    @IsNotEmpty()
    @IsString()
    firstName: string;

    @ApiProperty({
        example: 'Doe',
        description: 'The last name of the trainee user',
    })
    @IsNotEmpty()
    @IsString()
    lastName: string;

    @ApiProperty({
        example: 1,
        description: 'The ID of the active training split',
    })
    @IsNumber()
    activeTrainingSplitId?: number;

    @ApiProperty({
        example: 2,
        description: 'The ID of the last pending training split assignment',
    })
    @IsNumber({}, { each: true })
    pendingTrainingSplitIdList?: number[];
}
