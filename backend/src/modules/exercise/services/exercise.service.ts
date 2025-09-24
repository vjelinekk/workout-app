import { Injectable } from '@nestjs/common';
import { ExerciseRepository } from '../repositories/exercise.repository';
import { ExerciseCreateDto } from '../dtos/exercise/exercise-create.dto';
import { ExerciseEntity } from '../entities/exercise.entity';
import { ExerciseResponseDto } from '../dtos/exercise/exercise-response.dto';
import { ExercisePatchDto } from '../dtos/exercise/exercise-patch.dto';
import { ExerciseUpdateDto } from '../dtos/exercise/exercise-update.dto';
import { DeepPartial } from 'typeorm';
import { PublicAuthorizableCrudService } from 'src/common/services/public-authorizable-crud.service';

@Injectable()
export class ExerciseService extends PublicAuthorizableCrudService<
    ExerciseEntity,
    ExerciseCreateDto,
    ExerciseUpdateDto,
    ExercisePatchDto,
    ExerciseResponseDto,
    ExerciseRepository
> {
    constructor(protected readonly exerciseRepository: ExerciseRepository) {
        super(exerciseRepository);
    }

    protected getEntityName(): string {
        return 'Exercise';
    }

    protected toEntity(
        dto: ExerciseCreateDto,
        loggedInUserId?: number,
    ): DeepPartial<ExerciseEntity> {
        return {
            name: dto.name,
            bodyPart: dto.body_part,
            equipment: dto.equipment,
            description: dto.description,
            imageUrl: dto.image_url,
            isPublic: dto.is_public,
            isApproved: dto.is_approved,
            createdById: loggedInUserId,
        };
    }

    protected toResponseDto(entity: ExerciseEntity): ExerciseResponseDto {
        return {
            id: entity.id,
            name: entity.name,
            body_part: entity.bodyPart,
            equipment: entity.equipment,
            description: entity.description,
            image_url: entity.imageUrl,
            is_public: entity.isPublic,
            is_approved: entity.isApproved,
            category_id: entity.categoryId,
            created_at: entity.createdAt,
            updated_at: entity.updatedAt,
            created_by: entity.createdById,
            is_deleted: entity.isDeleted,
        };
    }
}
