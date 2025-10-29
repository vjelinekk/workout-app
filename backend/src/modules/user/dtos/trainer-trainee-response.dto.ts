import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsNumber, IsNotEmpty, IsString } from 'class-validator';
import { TrainerTraineeStatusEnum } from '../enums/trainer-trainee-status.enum';
import { UserResponseDto } from './user-response.dto';

export class TrainerTraineeResponseDto {
    @ApiProperty({
        description: 'Unique identifier of the request',
        example: 1,
    })
    @IsNumber()
    @IsNotEmpty()
    @Expose()
    id: number;

    @ApiProperty({
        description: 'Status of the trainer-trainee relationship',
        example: TrainerTraineeStatusEnum.PENDING,
    })
    @IsString()
    @IsNotEmpty()
    @Expose()
    status: TrainerTraineeStatusEnum;

    @ApiProperty({
        description: 'Trainer assigned to the trainee',
        type: UserResponseDto,
    })
    @Expose()
    @Type(() => UserResponseDto)
    trainer: UserResponseDto;
}
