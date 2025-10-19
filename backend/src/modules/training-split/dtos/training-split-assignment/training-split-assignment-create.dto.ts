import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class TrainingSplitAssignmentCreateDto {
    @ApiProperty({
        example: 1,
        description: 'The ID of the trainee user',
    })
    @IsInt()
    @IsNotEmpty()
    traineeId: number;

    @ApiProperty({
        example: 1,
        description: 'The ID of the training split',
    })
    @IsInt()
    @IsNotEmpty()
    trainingSplitId: number;
}
