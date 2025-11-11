import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import { ValidatedMappedCrudService } from 'src/common/services/validated-mapped-crud.service';
import { TrainingSplitDayEntity } from '../entities/training-split-day.entity';
import { TrainingSplitDayCreateDto } from '../dtos/training-split-day/training-split-day-create.dto';
import { TrainingSplitDayUpdateDto } from '../dtos/training-split-day/training-split-day-update.dto';
import { TrainingSplitDayPatchDto } from '../dtos/training-split-day/training-split-day-patch.dto';
import { TrainingSplitDayResponseDto } from '../dtos/training-split-day/training-split-day-response.dto';
import { TrainingSplitDayRepository } from '../repositories/training-split-day.repository';
import { JwtAuthenticatedUser } from 'src/modules/auth/types/jwt-authenticated-user.type';
import { TrainingSplitRepository } from '../repositories/training-split.repository';
import { RoleEnum } from 'src/modules/user/enums/role.enum';
import { WorkoutSessionPlanRepository } from 'src/modules/workout/repositories/workout-session-plan.repository';
import { DataSource, FindOptionsRelations } from 'typeorm';

/**
 * Training split day service for managing individual days within a training split.
 * Handles day-level CRUD operations and bulk operations for training split days.
 * Manages workout session plans assigned to each day with comprehensive access validation.
 */
@Injectable()
export class TrainingSplitDayService extends ValidatedMappedCrudService<
    TrainingSplitDayEntity,
    TrainingSplitDayCreateDto,
    TrainingSplitDayUpdateDto,
    TrainingSplitDayPatchDto,
    TrainingSplitDayResponseDto,
    TrainingSplitDayRepository
> {
    constructor(
        protected readonly trainingSplitDayRepository: TrainingSplitDayRepository,
        protected readonly trainingSplitRepository: TrainingSplitRepository,
        protected readonly workoutSessionPlanRepository: WorkoutSessionPlanRepository,
        private readonly dataSource: DataSource,
    ) {
        super(trainingSplitDayRepository);
    }

    protected get entityClass(): new () => TrainingSplitDayEntity {
        return TrainingSplitDayEntity;
    }
    protected get responseDtoClass(): new () => TrainingSplitDayResponseDto {
        return TrainingSplitDayResponseDto;
    }

    /**
     * Specifies relations to eager-load before validation.
     *
     * @returns FindOptionsRelations object with trainingSplit and workoutSessionPlan
     */
    protected getValidationRelations(): FindOptionsRelations<TrainingSplitDayEntity> {
        return {
            trainingSplit: true,
            workoutSessionPlan: true,
        };
    }

    protected validateEntityAccess(
        entity: TrainingSplitDayEntity,
        user: JwtAuthenticatedUser,
    ): void {
        if (user.roles.includes(RoleEnum.ADMIN)) {
            return;
        }

        // Relations are eagerly loaded by getValidationRelations()
        const trainingSplit = entity.trainingSplit;
        if (!trainingSplit) {
            throw new BadRequestException(
                `Cannot validate access to Training Split Day because associated Training Split with ID ${entity.trainingSplitId} does not exist.`,
            );
        }

        if (trainingSplit.createdById !== user.id) {
            throw new ForbiddenException(
                `You do not have permission to access Training Split Day with ID ${entity.id}.`,
            );
        }

        const workoutSessionPlan = entity.workoutSessionPlan;
        if (!workoutSessionPlan) {
            throw new BadRequestException(
                `Cannot validate access to Training Split Day because associated Workout Session Plan with ID ${entity.workoutSessionPlanId} does not exist.`,
            );
        }

        if (
            workoutSessionPlan.createdById !== user.id ||
            (!workoutSessionPlan.isPublic && !workoutSessionPlan.isApproved)
        ) {
            throw new ForbiddenException(
                `You do not have permission to access Training Split Day with ID ${entity.id}.`,
            );
        }
    }

    protected beforeCreate(
        dto: TrainingSplitDayCreateDto,
        user: JwtAuthenticatedUser,
    ): Promise<void> | void {
        void dto;
        void user;
    }

    protected beforeUpdate(
        dto: TrainingSplitDayUpdateDto | TrainingSplitDayPatchDto,
        entity: TrainingSplitDayEntity,
        user: JwtAuthenticatedUser,
    ): Promise<void> | void {
        void dto;
        void entity;
        void user;
    }

    protected beforeDelete(
        entity: TrainingSplitDayEntity,
        user: JwtAuthenticatedUser,
    ): Promise<void> | void {
        void entity;
        void user;
    }

    protected beforeRestore(
        entity: TrainingSplitDayEntity,
        user: JwtAuthenticatedUser,
    ): Promise<void> | void {
        void entity;
        void user;
    }

    /**
     * Bulk inserts multiple training split days for a training split.
     * Validates that all days were successfully inserted.
     *
     * @param createDtos Array of training split day creation DTOs
     * @param user The authenticated user creating the days
     * @throws InternalServerErrorException if not all days were successfully inserted
     */
    async createBulk(
        createDtos: TrainingSplitDayCreateDto[],
        user: JwtAuthenticatedUser,
    ): Promise<void> {
        const entities = createDtos.map((dto) => {
            const entity = this.toEntity(dto);
            entity.createdById = user.id;
            return entity;
        });

        const result = await this.trainingSplitDayRepository.insert(entities);

        if (result.identifiers.length !== createDtos.length) {
            throw new InternalServerErrorException(
                `Failed to insert all training split days. Expected ${createDtos.length}, inserted ${result.identifiers.length}`,
            );
        }
    }

    /**
     * Bulk updates training split days within a transaction.
     * Deletes all existing days for the split, then inserts new ones atomically.
     * Ensures data consistency if any operation fails.
     *
     * @param trainingSplitId The ID of the training split to update
     * @param createDtos Array of new training split day DTOs
     * @param user The authenticated user performing the update
     * @throws BadRequestException if no existing days found to delete
     * @throws InternalServerErrorException if not all new days were successfully inserted
     */
    async updateBulk(
        trainingSplitId: number,
        createDtos: TrainingSplitDayCreateDto[],
        user: JwtAuthenticatedUser,
    ) {
        // Use a transaction to ensure atomicity
        await this.dataSource.transaction(async (manager) => {
            // Get the repository from the transaction manager
            const trainingSplitDayRepo = manager.getRepository(
                TrainingSplitDayEntity,
            );

            // 1. Delete existing days for this training split
            const deleteResult = await trainingSplitDayRepo.delete({
                trainingSplitId,
            });

            // Optional: You can log or validate the deletion
            if (!deleteResult.affected || deleteResult.affected === 0) {
                throw new BadRequestException(
                    `No training split days found to delete for training split ID ${trainingSplitId}`,
                );
            }

            // 2. Create new entities
            const entities = createDtos.map((dto) => {
                const entity = this.toEntity(dto);
                entity.createdById = user.id;
                return entity;
            });

            // 3. Insert new days
            const result = await trainingSplitDayRepo.insert(entities);

            if (result.identifiers.length !== createDtos.length) {
                throw new InternalServerErrorException(
                    `Failed to insert all training split days. Expected ${createDtos.length}, inserted ${result.identifiers.length}`,
                );
            }
        });
    }

    /**
     * Retrieves all active training split days for a specific training split.
     * Returns days formatted as response DTOs.
     *
     * @param trainingSplitId The ID of the training split
     * @returns Array of training split day response DTOs for the split
     */
    async findAllByTrainingSplitIdActiveMapped(
        trainingSplitId: number,
    ): Promise<TrainingSplitDayResponseDto[]> {
        const entities = await this.trainingSplitDayRepository.findActive({
            where: {
                trainingSplitId,
            },
        });

        return entities.map((entity) => this.toResponseDto(entity));
    }
}
