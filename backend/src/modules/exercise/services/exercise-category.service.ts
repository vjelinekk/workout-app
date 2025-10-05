import { ExerciseCategoryEntity } from '../entities/exercise-category.entity';
import { ExerciseCategoryUpdateDto } from '../dtos/exercise-category/exercise-category-update.dto';
import { ExerciseCategoryRepository } from '../repositories/exercise-category.repository';
import { ExerciseCategoryPatchDto } from '../dtos/exercise-category/exercise-category-patch.dto';
import { MappedCrudService } from 'src/common/services/mapped-crud.service';
import { ExerciseCategoryResponseDto } from '../dtos/exercise-category/exercise-category-response.dto';
import { ExerciseCategoryCreateDto } from '../dtos/exercise-category/exercise-category-create.dto';
import { Injectable } from '@nestjs/common';

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

    protected toEntity(
        dto: ExerciseCategoryCreateDto,
    ): Partial<ExerciseCategoryEntity> {
        return {
            name: dto.name,
            description: dto.description,
        };
    }

    protected toEntityUpdate(
        dto: ExerciseCategoryUpdateDto | ExerciseCategoryPatchDto,
    ): Partial<ExerciseCategoryEntity> {
        const entityFields: Partial<ExerciseCategoryEntity> = {};

        if ('name' in dto && dto.name !== undefined) {
            entityFields.name = dto.name;
        }
        if ('description' in dto && dto.description !== undefined) {
            entityFields.description = dto.description;
        }

        return entityFields;
    }

    protected toResponseDto(
        entity: ExerciseCategoryEntity,
    ): ExerciseCategoryResponseDto {
        return {
            id: entity.id,
            name: entity.name,
            description: entity.description,
            created_at: entity.createdAt,
            updated_at: entity.updatedAt,
            is_deleted: entity.isDeleted,
        };
    }
}
