import { PartialType } from '@nestjs/swagger';
import { WorkoutSessionUpdateDto } from './workout-session-update.dto';

export class WorkoutSessionPatchDto extends PartialType(
    WorkoutSessionUpdateDto,
) {}
