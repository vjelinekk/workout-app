import { PartialType } from '@nestjs/swagger';
import { WorkoutSessionCreateDto } from './workout-session-create.dto';

export class WorkoutSessionPatchDto extends PartialType(
    WorkoutSessionCreateDto,
) {}
