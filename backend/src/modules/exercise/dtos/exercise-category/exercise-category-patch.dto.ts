import { PartialType } from '@nestjs/swagger';
import { ExerciseCategoryCreateDto } from './exercise-category-create.dto';

export class ExerciseCategoryPatchDto extends PartialType(
    ExerciseCategoryCreateDto,
) {}
