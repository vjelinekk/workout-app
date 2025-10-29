import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class TrainerTraineeRespondDto {
    @ApiProperty({
        description: 'Whether to accept or reject the trainer request',
        example: true,
    })
    @IsBoolean()
    @IsNotEmpty()
    accept: boolean;
}
