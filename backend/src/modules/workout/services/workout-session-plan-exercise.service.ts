import {
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { WorkoutSessionPlanExerciseEntity } from '../entities/workout-session-plan-exercise.entity';
import { WorkoutSessionPlanExerciseCreateDto } from '../dtos/workout-session-plan-exercise/workout-session-plan-exercise-create.dto';
import { WorkoutSessionPlanExerciseUpdateDto } from '../dtos/workout-session-plan-exercise/workout-session-plan-exercise-update.dto';
import { WorkoutSessionPlanExercisePatchDto } from '../dtos/workout-session-plan-exercise/workout-session-plan-exercise-patch.dto';
import { WorkoutSessionPlanExerciseResponseDto } from '../dtos/workout-session-plan-exercise/workout-session-plan-exercise-response.dto';
import { WorkoutSessionPlanExerciseRepository } from '../repositories/workout-session-plan-exercise.respository';
import { PlannedRepsSetsMismatchException } from '../exceptions/workout-session-plan-exercise/planned-reps-sets-mismatch.exception';
import { ValidatedMappedCrudService } from 'src/common/services/validated-mapped-crud.service';
import { JwtAuthenticatedUser } from 'src/modules/auth/types/jwt-authenticated-user.type';
import { WorkoutSessionPlanRepository } from '../repositories/workout-session-plan.repository';
import { RoleEnum } from 'src/modules/user/enums/role.enum';
import { DataSource } from 'typeorm';

/**
 * Workout session plan exercise service for managing exercises within a workout plan.
 * Handles exercise-level CRUD operations and bulk management for plan exercises.
 * Validates planned reps per set configuration and access control to parent plans.
 */
@Injectable()
export class WorkoutSessionPlanExerciseService extends ValidatedMappedCrudService<
    WorkoutSessionPlanExerciseEntity,
    WorkoutSessionPlanExerciseCreateDto,
    WorkoutSessionPlanExerciseUpdateDto,
    WorkoutSessionPlanExercisePatchDto,
    WorkoutSessionPlanExerciseResponseDto,
    WorkoutSessionPlanExerciseRepository
> {
    constructor(
        protected readonly workoutSessionPlanExerciseRepository: WorkoutSessionPlanExerciseRepository,
        protected readonly workoutSessionPlanRepository: WorkoutSessionPlanRepository,
        private readonly dataSource: DataSource,
    ) {
        super(workoutSessionPlanExerciseRepository);
    }

    protected get entityClass(): new () => WorkoutSessionPlanExerciseEntity {
        return WorkoutSessionPlanExerciseEntity;
    }
    protected get responseDtoClass(): new () => WorkoutSessionPlanExerciseResponseDto {
        return WorkoutSessionPlanExerciseResponseDto;
    }

    /**
     * @inheritdoc
     * @throws {NotFoundException} if the associated workout session plan does not exist
     * @throws {ForbiddenException} if the user does not have access to the associated workout session plan
     */
    protected async validateEntityAccess(
        entity: WorkoutSessionPlanExerciseEntity,
        user: JwtAuthenticatedUser,
    ): Promise<void> {
        const planId = entity.workoutSessionPlanId;
        const plan =
            await this.workoutSessionPlanRepository.findByIdActive(planId);

        if (!plan) {
            throw new NotFoundException(
                `Workout session plan with ID ${planId} not found`,
            );
        }

        if (user.roles.includes(RoleEnum.ADMIN)) {
            // Admins have access to all resources
            return;
        }

        if (plan?.createdById !== user.id) {
            throw new ForbiddenException('Access to resource denied');
        }
    }

    protected beforeCreate(dto: WorkoutSessionPlanExerciseCreateDto): void {
        this.validatePlannedRepsPerSet(dto.plannedSets, dto.plannedRepsPerSet);
    }

    /**
     * @inheritdoc
     * @throws {PlannedRepsSetsMismatchException} if the lengths of planned sets and planned reps per set do not match
     */
    protected beforeUpdate(
        dto:
            | WorkoutSessionPlanExerciseUpdateDto
            | WorkoutSessionPlanExercisePatchDto,
        entity: WorkoutSessionPlanExerciseEntity,
    ): void {
        if (
            dto.plannedSets !== undefined &&
            dto.plannedRepsPerSet !== undefined
        ) {
            this.validatePlannedRepsPerSet(
                dto.plannedSets,
                dto.plannedRepsPerSet,
            );
        } else if (dto.plannedSets !== undefined) {
            this.validatePlannedRepsPerSet(
                dto.plannedSets,
                entity.plannedRepsPerSet,
            );
        } else if (dto.plannedRepsPerSet !== undefined) {
            this.validatePlannedRepsPerSet(
                entity.plannedSets,
                dto.plannedRepsPerSet,
            );
        }
    }
    protected beforeDelete(
        entity: WorkoutSessionPlanExerciseEntity,
        user: JwtAuthenticatedUser,
    ): void {
        void entity;
        void user;
    }

    protected beforeRestore(
        entity: WorkoutSessionPlanExerciseEntity,
        user: JwtAuthenticatedUser,
    ): void {
        void entity;
        void user;
    }

    /**
     * Validates the planned reps per set against the planned sets count.
     * @param plannedSets number of planned sets
     * @param plannedRepsPerSet array of planned reps per set
     * @throws {PlannedRepsSetsMismatchException} if the lengths do not match
     */
    private validatePlannedRepsPerSet(
        plannedSets: number,
        plannedRepsPerSet: number[],
    ) {
        if (plannedRepsPerSet.length !== plannedSets) {
            throw new PlannedRepsSetsMismatchException(
                plannedSets,
                plannedRepsPerSet.length,
            );
        }
    }

    /**
     * Retrieves all active exercises for a workout session plan, ordered by exercise order.
     *
     * @param workoutSessionPlanId The ID of the workout session plan
     * @returns Array of exercise response DTOs ordered by their position in the plan
     */
    public async findAllActiveByWorkoutSessionPlanIdMapped(
        workoutSessionPlanId: number,
    ): Promise<WorkoutSessionPlanExerciseResponseDto[]> {
        const entities =
            await this.workoutSessionPlanExerciseRepository.findActive({
                where: {
                    workoutSessionPlanId,
                },
                order: {
                    order: 'ASC',
                },
            });

        return entities.map((entity) => this.toResponseDto(entity));
    }

    /**
     * Bulk inserts multiple exercises for a workout session plan.
     * Validates that all exercises were successfully inserted.
     *
     * @param createDtos Array of exercise creation DTOs
     * @param user The authenticated user creating the exercises
     * @throws InternalServerErrorException if not all exercises were successfully inserted
     */
    public async createBulk(
        createDtos: WorkoutSessionPlanExerciseCreateDto[],
        user: JwtAuthenticatedUser,
    ): Promise<void> {
        const entities = createDtos.map((dto) => {
            const entity = this.toEntity(dto);
            entity.createdById = user.id;
            return entity;
        });

        const result =
            await this.workoutSessionPlanExerciseRepository.insert(entities);

        if (result.identifiers.length !== createDtos.length) {
            throw new InternalServerErrorException(
                `Failed to insert all workout session plan exercises. Expected ${createDtos.length}, inserted ${result.identifiers.length}`,
            )
        }
    }

    /**
     * Bulk updates exercises for a workout session plan within a transaction.
     * Deletes all existing exercises, then inserts new ones atomically.
     * Ensures data consistency if any operation fails.
     *
     * @param workoutSessionPlanId The ID of the workout session plan to update
     * @param createDtos Array of new exercise DTOs
     * @param user The authenticated user performing the update
     * @throws NotFoundException if no existing exercises found to delete
     * @throws InternalServerErrorException if not all new exercises were successfully inserted
     */
    public async updateBulk(
        workoutSessionPlanId: number,
        createDtos: WorkoutSessionPlanExerciseCreateDto[],
        user: JwtAuthenticatedUser,
    ): Promise<void> {
        // Use a transaction to ensure atomicity
        await this.dataSource.transaction(async (manager) => {
            // Get the repository from the transaction manager
            const workoutSessionPlanExerciseRepo = manager.getRepository(
                WorkoutSessionPlanExerciseEntity,
            );

            // 1. Delete existing exercises for this workout session plan
            const deleteResult = await workoutSessionPlanExerciseRepo.delete({
                workoutSessionPlanId,
            });

            if (!deleteResult.affected || deleteResult.affected === 0) {
                throw new NotFoundException(
                    `No workout session plan exercises found for workout session plan ID ${workoutSessionPlanId} to update`,
                );
            }

            // 2. Create new entities
            const entities = createDtos.map((dto) => {
                const entity = this.toEntity(dto);
                entity.createdById = user.id;
                return entity;
            });

            // 3. Insert new exercises
            const result = await workoutSessionPlanExerciseRepo.insert(entities);

            if (result.identifiers.length !== createDtos.length) {
                throw new InternalServerErrorException(
                    `Failed to insert all workout session plan exercises. Expected ${createDtos.length}, inserted ${result.identifiers.length}`,
                );
            }
        });
    }
}
