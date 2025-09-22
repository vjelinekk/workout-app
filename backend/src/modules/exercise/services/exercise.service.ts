import { ForbiddenException, Injectable } from '@nestjs/common';
import { ExerciseRepository } from '../repositories/exercise.repository';
import { ExerciseCreateDto } from '../dtos/exercise/exercise-create.dto';
import { ExerciseEntity } from '../entities/exercise.entity';
import { ExerciseResponseDto } from '../dtos/exercise/exercise-response.dto';
import { ExercisePatchDto } from '../dtos/exercise/exercise-patch.dto';
import { ExerciseUpdateDto } from '../dtos/exercise/exercise-update.dto';
import { MappedCrudService } from 'src/common/services/mapped-crud.service';
import { DeepPartial } from 'typeorm';

@Injectable()
export class ExerciseService extends MappedCrudService<
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
        };
    }

    /**
     * @param id ID of exercise to update
     * @param exerciseDto DTO with the updated data
     * @returns DTO containing the updated row
     */
    async updateExercise(
        id: number,
        exerciseDto: ExercisePatchDto | ExerciseUpdateDto,
    ): Promise<ExerciseResponseDto> {
        const exercise = await this.findOne(id);

        if (exercise.isPublic && exercise.isApproved) {
            throw new ForbiddenException(
                'Cannot update exercise that is publicly visible to other users',
            );
        }

        Object.assign(exercise, exerciseDto);

        return this.updateMapped(id, exerciseDto);
    }
}
