import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { ExerciseRepository } from '../repositories/exercise.repository';
import { ExerciseCreateDto } from '../dtos/exercise/exercise-create.dto';
import { ExerciseEntity } from '../entities/exercise.entity';
import { ExerciseResponseDto } from '../dtos/exercise/exercise-response.dto';
import { ExercisePatchDto } from '../dtos/exercise/exercise-patch.dto';
import { ExerciseUpdateDto } from '../dtos/exercise/exercise-update.dto';
import { PublicAuthorizableCrudService } from 'src/common/services/public-authorizable-crud.service';
import { JwtAuthenticatedUser } from 'src/modules/auth/types/jwt-authenticated-user.type';
import { RoleEnum } from 'src/modules/user/enums/role.enum';

/**
 * Exercise service for managing exercises with image uploads and public/private visibility.
 * Handles exercise CRUD operations, image file management, and access control.
 * Supports exercise categorization and admin approval workflow for public exercises.
 */
@Injectable()
export class ExerciseService extends PublicAuthorizableCrudService<
    ExerciseEntity,
    ExerciseCreateDto,
    ExerciseUpdateDto,
    ExercisePatchDto,
    ExerciseResponseDto,
    ExerciseRepository
> {
    private readonly logger = new Logger(ExerciseService.name);

    constructor(
        protected readonly exerciseRepository: ExerciseRepository,
    ) {
        super(exerciseRepository);
    }

    protected getEntityName(): string {
        return 'Exercise';
    }

    protected get entityClass(): new () => ExerciseEntity {
        return ExerciseEntity;
    }
    protected get responseDtoClass(): new () => ExerciseResponseDto {
        return ExerciseResponseDto;
    }

    protected beforeCreate(
        dto: ExerciseCreateDto,
        user: JwtAuthenticatedUser,
    ): void {
        if (dto.isApproved && !user.roles.includes(RoleEnum.ADMIN)) {
            throw new UnauthorizedException(
                'Only admins can create approved exercises.',
            );
        }
    }

    protected beforeUpdate(
        dto: ExerciseUpdateDto | ExercisePatchDto,
        entity: ExerciseEntity,
        user: JwtAuthenticatedUser,
    ): void {
        // Only admins can change the approval status
        if (
            'isApproved' in dto &&
            dto.isApproved !== undefined &&
            dto.isApproved !== entity.isApproved &&
            !user.roles.includes(RoleEnum.ADMIN)
        ) {
            throw new UnauthorizedException(
                'Only admins can change the approval status of exercises.',
            );
        }

        // Only admins can change the public visibility flag directly
        if (
            'isPublic' in dto &&
            dto.isPublic !== undefined &&
            dto.isPublic !== entity.isPublic &&
            !user.roles.includes(RoleEnum.ADMIN)
        ) {
            throw new UnauthorizedException(
                'Only admins can change the public visibility of exercises.',
            );
        }
    }

    protected beforeDelete(
        entity: ExerciseEntity,
        user: JwtAuthenticatedUser,
    ): void {
        void entity;
        void user;
    }

    protected beforeRestore(
        entity: ExerciseEntity,
        user: JwtAuthenticatedUser,
    ): void {
        void entity;
        void user;
    }

    async deleteValidated(
        id: number,
        user: JwtAuthenticatedUser,
    ): Promise<ExerciseResponseDto> {
        // Fetch before delete to capture the current image URL
        const entityBeforeDelete = await this.repository.findByIdActive(id);
        const imageUrl = entityBeforeDelete?.imageUrl;

        // Perform the actual delete validation and soft-delete
        const result = await super.deleteValidated(id, user);

        // Clean up the image file after successful deletion
        if (imageUrl) {
            const imagePath = join(process.cwd(), imageUrl);
            try {
                await fs.unlink(imagePath);
            } catch (error) {
                // Ignore errors if the file doesn't exist, e.g., was already deleted
                this.logger.warn(`Failed to delete image at ${imagePath}: ${error}`);
            }
        }

        return result;
    }

    async updateValidated(
        id: number,
        dto: ExerciseUpdateDto | ExercisePatchDto,
        user: JwtAuthenticatedUser,
    ): Promise<ExerciseResponseDto> {
        const oldEntity = await this.repository.findByIdActive(id);
        const oldImageUrl = oldEntity?.imageUrl;

        const updatedExercise = await super.updateValidated(id, dto, user);

        if (oldImageUrl && oldImageUrl !== updatedExercise.imageUrl) {
            const imagePath = join(process.cwd(), oldImageUrl);
            try {
                await fs.unlink(imagePath);
            } catch (error: unknown) {
                // Ignore errors if the file doesn't exist
                void error;
            }
        }

        return updatedExercise;
    }
}
