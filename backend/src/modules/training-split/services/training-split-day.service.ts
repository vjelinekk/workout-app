import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { ValidatedMappedCrudService } from 'src/common/services/validated-mapped-crud.service';
import { TrainingSplitDayEntity } from '../entities/training-split-day.entity';
import { TrainingSplitDayCreateDto } from '../dtos/training-split-day/training-split-day-create.dto';
import { TrainingSplitDayUpdateDto } from '../dtos/training-split-day/training-split-day-update.dto';
import { TrainingSplitDayPatchDto } from '../dtos/training-split-day/training-split-day-patch.dto';
import { TrainingSplitDayResponseDto } from '../dtos/training-split-day/training-split-day-response.dto';
import { TrainingSplitDayRepository } from '../repositories/training-split-day.repository';
import { JwtAuthenticatedUser } from 'src/modules/auth/types/jwt-authenticated-user.type';
import { DeepPartial } from 'typeorm';
import { TrainingSplitRepository } from '../repositories/training-split.repository';
import { RoleEnum } from 'src/modules/user/enums/role.enum';
import { WorkoutSessionPlanRepository } from 'src/modules/workout/repositories/workout-session-plan.repository';

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
    ) {
        super(trainingSplitDayRepository);
    }

    protected async validateEntityAccess(
        entity: TrainingSplitDayEntity,
        user: JwtAuthenticatedUser,
    ): Promise<void> {
        if (user.roles.includes(RoleEnum.ADMIN)) {
            return;
        }

        const trainingSplitId = entity.trainingSplitId;
        if (trainingSplitId === undefined) {
            throw new BadRequestException(
                'Cannot validate access to Training Split Day without Training Split ID loaded.',
            );
        }

        const trainingSplit = await this.trainingSplitRepository.findByIdActive(trainingSplitId);
        if (trainingSplit === null) {
            throw new BadRequestException(
                `Cannot validate access to Training Split Day because associated Training Split with ID ${trainingSplitId} does not exist.`,
            );
        }

        if (trainingSplit.createdById !== user.id) {
            throw new ForbiddenException(
                `You do not have permission to access Training Split Day with ID ${entity.id}.`,
            );
        }

        const workoutSessionPlanId = entity.workoutSessionPlanId;
        if (workoutSessionPlanId === undefined) {
            throw new BadRequestException(
                'Cannot validate access to Training Split Day without Workout Session Plan ID loaded.',
            );
        }

        const workoutSessionPlan = await this.workoutSessionPlanRepository.findByIdActive(workoutSessionPlanId);
        if (workoutSessionPlan === null) {
            throw new BadRequestException(
                `Cannot validate access to Training Split Day because associated Workout Session Plan with ID ${workoutSessionPlanId} does not exist.`,
            );
        }

        if (workoutSessionPlan.createdById !== user.id || (!workoutSessionPlan.isPublic && !workoutSessionPlan.isApproved)) {
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

    protected toEntity(
        dto: TrainingSplitDayCreateDto,
    ): DeepPartial<TrainingSplitDayEntity> {
        return {
            trainingSplit: { id: dto.training_split_id },
            workoutSessionPlan: { id: dto.workout_session_plan_id },
            dayOfWeek: dto.day_of_week,
            order: dto.order,
        };
    }

    protected toResponseDto(
        entity: TrainingSplitDayEntity,
    ): TrainingSplitDayResponseDto {
        return {
            id: entity.id,
            training_split_id: entity.trainingSplitId,
            workout_session_plan_id: entity.workoutSessionPlanId,
            day_of_week: entity.dayOfWeek,
            order: entity.order,
            created_by: entity.createdById,
            created_at: entity.createdAt,
            updated_at: entity.updatedAt,
            is_deleted: entity.isDeleted,
        };
    }

    protected toEntityUpdate(
        dto: TrainingSplitDayUpdateDto | TrainingSplitDayPatchDto,
    ): Partial<TrainingSplitDayEntity> {
        const entityFields: Partial<TrainingSplitDayEntity> = {};

        if ('training_split_id' in dto && dto.training_split_id !== undefined) {
            entityFields.trainingSplitId = dto.training_split_id;
        }
        if (
            'workout_session_plan_id' in dto &&
            dto.workout_session_plan_id !== undefined
        ) {
            entityFields.workoutSessionPlanId = dto.workout_session_plan_id;
        }
        if ('day_of_week' in dto && dto.day_of_week !== undefined) {
            entityFields.dayOfWeek = dto.day_of_week;
        }
        if ('order' in dto && dto.order !== undefined) {
            entityFields.order = dto.order;
        }

        return entityFields;
    }
}
