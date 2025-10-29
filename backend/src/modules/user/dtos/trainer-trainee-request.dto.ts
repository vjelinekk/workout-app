import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class TrainerTraineeRequestDto {
    @ApiProperty({
        description: 'ID of the trainee to whom the trainer request is sent',
        example: 2,
    })
    @IsNumber()
    @IsNotEmpty()
    traineeId: number;
}
