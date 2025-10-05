import { Injectable } from '@nestjs/common';
import { ValidatedMappedCrudService } from 'src/common/services/validated-mapped-crud.service';
import { WorkoutSessionEntity } from '../entities/workout-session.entity';
import { WorkoutSessionCreateDto } from '../dtos/workout-session/workout-session-create.dto';
import { WorkoutSessionUpdateDto } from '../dtos/workout-session/workout-session-update.dto';
import { WorkoutSessionPatchDto } from '../dtos/workout-session/workout-session-patch.dto';
import { WorkoutSessionResponseDto } from '../dtos/workout-session/workout-session-response.dto';
import { WorkoutSessionRepository } from '../repositories/workout-session.repository';
import { JwtAuthenticatedUser } from 'src/modules/auth/types/jwt-authenticated-user.type';
import { DeepPartial } from 'typeorm';

@Injectable()
export class WorkoutSessionService extends ValidatedMappedCrudService<
    WorkoutSessionEntity,
    WorkoutSessionCreateDto,
    WorkoutSessionUpdateDto,
    WorkoutSessionPatchDto,
    WorkoutSessionResponseDto,
    WorkoutSessionRepository
> {
    constructor(
        protected readonly workoutSessionRepository: WorkoutSessionRepository,
    ) {
        super(workoutSessionRepository);
    }

    protected validateEntityAccess(
        entity: WorkoutSessionEntity,
        user: JwtAuthenticatedUser,
    ): void | Promise<void> {
        void entity;
        void user;
    }

    protected beforeCreate(
        dto: WorkoutSessionCreateDto,
        user: JwtAuthenticatedUser,
    ): Promise<void> | void {
        void dto;
        void user;
    }

    protected beforeUpdate(
        dto: WorkoutSessionUpdateDto | WorkoutSessionPatchDto,
        entity: WorkoutSessionEntity,
        user: JwtAuthenticatedUser,
    ): Promise<void> | void {
        void dto;
        void entity;
        void user;
    }

    protected beforeDelete(
        entity: WorkoutSessionEntity,
        user: JwtAuthenticatedUser,
    ): Promise<void> | void {
        void entity;
        void user;
    }

    protected beforeRestore(
        entity: WorkoutSessionEntity,
        user: JwtAuthenticatedUser,
    ): Promise<void> | void {
        void entity;
        void user;
    }

    protected toEntity(
        dto: WorkoutSessionCreateDto,
    ): DeepPartial<WorkoutSessionEntity> {
        return {
            workoutSessionPlanId: dto.workout_session_plan_id,
            trainingSplitId: dto.training_split_id,
        };
    }

    protected toResponseDto(
        entity: WorkoutSessionEntity,
    ): WorkoutSessionResponseDto {
        return {
            id: entity.id,
            performed_by_id: entity.performedById,
            workout_session_plan_id: entity.workoutSessionPlanId,
            training_split_id: entity.trainingSplitId,
            status: entity.status,
            started_at: entity.startedAt?.toISOString(),
            finished_at: entity.finishedAt?.toISOString(),
            notes: entity.notes,
            duration_seconds: entity.durationSeconds,
            created_by: entity.createdById,
            created_at: entity.createdAt,
            updated_at: entity.updatedAt,
            is_deleted: entity.isDeleted,
        };
    }

    protected toEntityUpdate(
        dto: WorkoutSessionUpdateDto | WorkoutSessionPatchDto,
    ): Partial<WorkoutSessionEntity> {
        const entityFields: Partial<WorkoutSessionEntity> = {};

        if ('performed_by_id' in dto && dto.performed_by_id !== undefined) {
            entityFields.performedBy = { id: dto.performed_by_id } as any;
        }
        if (
            'workout_session_plan_id' in dto &&
            dto.workout_session_plan_id !== undefined
        ) {
            entityFields.workoutSessionPlanId = dto.workout_session_plan_id;
        }
        if ('training_split_id' in dto && dto.training_split_id !== undefined) {
            entityFields.trainingSplitId = dto.training_split_id;
        }

        return entityFields;
    }
}
