import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class TrainingSplitAssignmentCreateDto {
    @ApiProperty({
        example: 1,
        description: 'The ID of the trainee user',
    })
    @IsInt()
    @IsNotEmpty()
    trainee_id: number;

    @ApiProperty({
        example: 1,
        description: 'The ID of the training split',
    })
    @IsInt()
    @IsNotEmpty()
    training_split_id: number;
}
