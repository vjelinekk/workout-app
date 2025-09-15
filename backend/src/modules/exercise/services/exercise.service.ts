import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { ExerciseRepository } from '../repositories/exercise.repository';
import { ExerciseCreateDto } from '../dtos/exercise/exercise-create.dto';
import { ExerciseEntity } from '../entities/exercise.entity';
import { ExerciseResponseDto } from '../dtos/exercise/exercise-response.dto';
import { DeepPartial } from 'typeorm';
import { ExercisePatchDto } from '../dtos/exercise/exercise-patch.dto';
import { ExerciseUpdateDto } from '../dtos/exercise/exercise-update.dto';

@Injectable()
export class ExerciseService {
    constructor(private readonly exerciseRepository: ExerciseRepository) {}

    /**
     * Maps exercise entity into response DTO
     * 
     * @param entity Entity to map to response DTO
     * @returns response DTO
     */
    mapExerciseEntityToExerciseResponseDto(
        entity: ExerciseEntity,
    ): ExerciseResponseDto {
        return {
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
     * Maps exercise DTO into exercise entity
     * 
     * @param dto DTO to map into exercise entity
     * @param loggedInUserId ID of currently logged in user
     * @returns Exercise entity
     */
    mapCreateExerciseDtoToExerciseEntity(
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

    /**
     * @param createExerciseDto DTO for creating new exercise
     * @param loggedInUserId ID of currently logged in user
     * @returns DTO containing the data of newly created row
     */
    async createExercise(
        createExerciseDto: ExerciseCreateDto,
        loggedInUserId: number,
    ): Promise<ExerciseResponseDto> {
        const exercise = await this.exerciseRepository.save(
            this.mapCreateExerciseDtoToExerciseEntity(
                createExerciseDto,
                loggedInUserId,
            ),
        );

        return this.mapExerciseEntityToExerciseResponseDto(exercise);
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
        const exercise = await this.exerciseRepository.findByIdActive(id);

        if (!exercise) {
            throw new NotFoundException('Exercise not found');
        }

        if (exercise.isPublic && exercise.isApproved) {
            throw new ForbiddenException(
                'Cannot update exercise that is publicly visible to other users',
            );
        }

        exercise.updatedAt = new Date();

        Object.assign(exercise, exerciseDto);

        const updatedExercise = await this.exerciseRepository.save(exercise);

        return this.mapExerciseEntityToExerciseResponseDto(updatedExercise);
    }

    /**
     * @param id ID of the exercise to delete
     */
    async deleteExercise(id: number) {
        await this.exerciseRepository.softDeleteById(id);
    }

    /**
     * @param id ID of the exercise to retrieve
     * @returns DTO containing info about exercise
     */
    async getExerciseById(id: number): Promise<ExerciseResponseDto> {
        const exercise = await this.exerciseRepository.findByIdActive(id);

        if (!exercise) {
            throw new NotFoundException('Exercise not found');
        }

        return this.mapExerciseEntityToExerciseResponseDto(exercise);
    }

    /**
     * @returns All active exercises
     */
    async getAllExercises(): Promise<ExerciseResponseDto[]> {
        const exercises = await this.exerciseRepository.findActive();

        return exercises.map((exercise) =>
            this.mapExerciseEntityToExerciseResponseDto(exercise),
        );
    }
}
