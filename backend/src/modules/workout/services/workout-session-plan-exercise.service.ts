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
