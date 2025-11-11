import { ExerciseCategoryEntity } from '../entities/exercise-category.entity';
import { ExerciseCategoryUpdateDto } from '../dtos/exercise-category/exercise-category-update.dto';
import { ExerciseCategoryRepository } from '../repositories/exercise-category.repository';
import { ExerciseCategoryPatchDto } from '../dtos/exercise-category/exercise-category-patch.dto';
import { MappedCrudService } from 'src/common/services/mapped-crud.service';
import { ExerciseCategoryResponseDto } from '../dtos/exercise-category/exercise-category-response.dto';
import { ExerciseCategoryCreateDto } from '../dtos/exercise-category/exercise-category-create.dto';
import { Injectable } from '@nestjs/common';

/**
 * Exercise category service for managing exercise categorization.
 * Provides CRUD operations for exercise categories used to organize exercises.
 * Supports category-based filtering and exercise organization.
 */
@Injectable()
export class ExerciseCategoryService extends MappedCrudService<
    ExerciseCategoryEntity,
    ExerciseCategoryCreateDto,
    ExerciseCategoryUpdateDto,
    ExerciseCategoryPatchDto,
    ExerciseCategoryResponseDto,
    ExerciseCategoryRepository
> {
    constructor(
        protected readonly exerciseCategoryRepository: ExerciseCategoryRepository,
    ) {
        super(exerciseCategoryRepository);
    }

    protected get entityClass(): new () => ExerciseCategoryEntity {
        return ExerciseCategoryEntity;
    }
    protected get responseDtoClass(): new () => ExerciseCategoryResponseDto {
        return ExerciseCategoryResponseDto;
    }
}
