import { PartialType } from '@nestjs/swagger';
import { ExerciseCreateDto } from './exercise-create.dto';

export class ExercisePatchDto extends PartialType(ExerciseCreateDto) {}
