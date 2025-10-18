import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { WorkoutSessionPlanExerciseEntity } from '../entities/workout-session-plan-exercise.entity';
import { WorkoutSessionPlanExerciseCreateDto } from '../dtos/workout-session-plan-exercise/workout-session-plan-exercise-create.dto';
import { WorkoutSessionPlanExerciseUpdateDto } from '../dtos/workout-session-plan-exercise/workout-session-plan-exercise-update.dto';
import { WorkoutSessionPlanExercisePatchDto } from '../dtos/workout-session-plan-exercise/workout-session-plan-exercise-patch.dto';
import { WorkoutSessionPlanExerciseResponseDto } from '../dtos/workout-session-plan-exercise/workout-session-plan-exercise-response.dto';
import { WorkoutSessionPlanExerciseRepository } from '../repositories/workout-session-plan-exercise.respository';
import { DeepPartial } from 'typeorm';
import { PlannedRepsSetsMismatchException } from '../exceptions/workout-session-plan-exercise/planned-reps-sets-mismatch.exception';
import { ValidatedMappedCrudService } from 'src/common/services/validated-mapped-crud.service';
import { JwtAuthenticatedUser } from 'src/modules/auth/types/jwt-authenticated-user.type';
import { WorkoutSessionPlanRepository } from '../repositories/workout-session-plan.repository';
import { RoleEnum } from 'src/modules/user/enums/role.enum';

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
    ) {
        super(workoutSessionPlanExerciseRepository);
    }

    protected toEntity(
        dto: WorkoutSessionPlanExerciseCreateDto,
    ): DeepPartial<WorkoutSessionPlanExerciseEntity> {
        return {
            workoutSessionPlanId: dto.workout_session_plan_id,
            exerciseId: dto.exercise_id,
            order: dto.order,
            plannedSets: dto.planned_sets,
            plannedRepsPerSet: dto.planned_reps_per_set,
        };
    }

    protected toEntityUpdate(
        dto:
            | WorkoutSessionPlanExerciseUpdateDto
            | WorkoutSessionPlanExercisePatchDto,
    ): Partial<WorkoutSessionPlanExerciseEntity> {
        const entityFields: Partial<WorkoutSessionPlanExerciseEntity> = {};

        if (
            'workout_session_plan_id' in dto &&
            dto.workout_session_plan_id !== undefined
        ) {
            entityFields.workoutSessionPlanId = dto.workout_session_plan_id;
        }
        if ('exercise_id' in dto && dto.exercise_id !== undefined) {
            entityFields.exerciseId = dto.exercise_id;
        }
        if ('order' in dto && dto.order !== undefined) {
            entityFields.order = dto.order;
        }
        if ('planned_sets' in dto && dto.planned_sets !== undefined) {
            entityFields.plannedSets = dto.planned_sets;
        }
        if (
            'planned_reps_per_set' in dto &&
            dto.planned_reps_per_set !== undefined
        ) {
            entityFields.plannedRepsPerSet = dto.planned_reps_per_set;
        }

        return entityFields;
    }

    protected toResponseDto(
        entity: WorkoutSessionPlanExerciseEntity,
    ): WorkoutSessionPlanExerciseResponseDto {
        return {
            id: entity.id,
            workout_session_plan_id: entity.workoutSessionPlanId,
            exercise_id: entity.exerciseId,
            order: entity.order,
            planned_sets: entity.plannedSets,
            planned_reps_per_set: entity.plannedRepsPerSet,
            created_at: entity.createdAt,
            updated_at: entity.updatedAt,
            is_deleted: entity.isDeleted,
        };
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
        this.validatePlannedRepsPerSet(
            dto.planned_sets,
            dto.planned_reps_per_set,
        );
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
            dto.planned_sets !== undefined &&
            dto.planned_reps_per_set !== undefined
        ) {
            this.validatePlannedRepsPerSet(
                dto.planned_sets,
                dto.planned_reps_per_set,
            );
        } else if (dto.planned_sets !== undefined) {
            this.validatePlannedRepsPerSet(
                dto.planned_sets,
                entity.plannedRepsPerSet,
            );
        } else if (dto.planned_reps_per_set !== undefined) {
            this.validatePlannedRepsPerSet(
                entity.plannedSets,
                dto.planned_reps_per_set,
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
            // TODO: exception
        }
    }

    public async updateBulk(
        workoutSessionPlanId: number,
        createDtos: WorkoutSessionPlanExerciseCreateDto[],
        user: JwtAuthenticatedUser,
    ): Promise<void> {
        const entities = createDtos.map((dto) => {
            const entity = this.toEntity(dto);
            entity.createdById = user.id;
            return entity;
        });

        const deleteResult =
            await this.workoutSessionPlanExerciseRepository.delete({
                workoutSessionPlanId,
            });

        if (!deleteResult.affected || deleteResult.affected === 0) {
            // TODO: exception
        }

        const result =
            await this.workoutSessionPlanExerciseRepository.insert(entities);

        if (result.identifiers.length !== createDtos.length) {
            // TODO: exception
        }
    }
}
