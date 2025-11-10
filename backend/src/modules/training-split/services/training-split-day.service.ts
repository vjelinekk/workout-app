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

    protected async validateEntityAccess(
        entity: TrainingSplitDayEntity,
        user: JwtAuthenticatedUser,
    ): Promise<void> {
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

    async updateBulk(
        trainingSplitId: number,
        createDtos: TrainingSplitDayCreateDto[],
        user: JwtAuthenticatedUser,
    ) {
        // Use a transaction to ensure atomicity
        await this.dataSource.transaction(async (manager) => {
            // Get the repository from the transaction manager
            const trainingSplitDayRepo = manager.getRepository(TrainingSplitDayEntity);

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
