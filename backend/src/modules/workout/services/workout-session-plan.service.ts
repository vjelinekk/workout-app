import { WorkoutSessionPlanEntity } from '../entities/workout-session-plan.entity';
import { WorkoutSessionPlanCreateDto } from '../dtos/workout-session-plan/workout-session-plan-create.dto';
import { WorkoutSessionPlanUpdateDto } from '../dtos/workout-session-plan/workout-session-plan-update.dto';
import { WorkoutSessionPlanPatchDto } from '../dtos/workout-session-plan/workout-session-plan-patch.dto';
import { WorkoutSessionPlanResponseDto } from '../dtos/workout-session-plan/workout-session-plan-response.dto';
import { WorkoutSessionPlanRepository } from '../repositories/workout-session-plan.repository';
import { Injectable } from '@nestjs/common';
import { DeepPartial } from 'typeorm';
import { PublicAuthorizableCrudService } from 'src/common/services/public-authorizable-crud.service';

@Injectable()
export class WorkoutSessionPlanService extends PublicAuthorizableCrudService<
    WorkoutSessionPlanEntity,
    WorkoutSessionPlanCreateDto,
    WorkoutSessionPlanUpdateDto,
    WorkoutSessionPlanPatchDto,
    WorkoutSessionPlanResponseDto,
    WorkoutSessionPlanRepository
> {
    constructor(
        protected readonly workoutSessionPlanRepository: WorkoutSessionPlanRepository,
    ) {
        super(workoutSessionPlanRepository);
    }

    protected getEntityName(): string {
        return 'workout session plan';
    }

    protected toEntity(
        dto: WorkoutSessionPlanCreateDto,
        loggedInUserId?: number,
    ): DeepPartial<WorkoutSessionPlanEntity> {
        return {
            name: dto.name,
            description: dto.description,
            createdById: loggedInUserId,
        };
    }

    protected toResponseDto(
        entity: WorkoutSessionPlanEntity,
    ): WorkoutSessionPlanResponseDto {
        return {
            id: entity.id,
            name: entity.name,
            description: entity.description,
            is_public: entity.isPublic,
            created_at: entity.createdAt,
            updated_at: entity.updatedAt,
            created_by: entity.createdById,
            is_approved: entity.isApproved,
            is_deleted: entity.isDeleted,
        };
    }
}
