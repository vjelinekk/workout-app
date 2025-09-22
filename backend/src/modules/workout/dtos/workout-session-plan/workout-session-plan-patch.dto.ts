import { PartialType } from '@nestjs/swagger';
import { WorkoutSessionPlanCreateDto } from './workout-session-plan-create.dto';

export class WorkoutSessionPlanPatchDto extends PartialType(
    WorkoutSessionPlanCreateDto,
) {}
