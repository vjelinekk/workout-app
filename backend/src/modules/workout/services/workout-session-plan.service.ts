import { WorkoutSessionPlanEntity } from '../entities/workout-session-plan.entity';
import { WorkoutSessionPlanCreateDto } from '../dtos/workout-session-plan/workout-session-plan-create.dto';
import { WorkoutSessionPlanUpdateDto } from '../dtos/workout-session-plan/workout-session-plan-update.dto';
import { WorkoutSessionPlanPatchDto } from '../dtos/workout-session-plan/workout-session-plan-patch.dto';
import { WorkoutSessionPlanResponseDto } from '../dtos/workout-session-plan/workout-session-plan-response.dto';
import { WorkoutSessionPlanRepository } from '../repositories/workout-session-plan.repository';
import { Injectable } from '@nestjs/common';
import { PublicAuthorizableCrudService } from 'src/common/services/public-authorizable-crud.service';
import { JwtAuthenticatedUser } from 'src/modules/auth/types/jwt-authenticated-user.type';

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

    protected get entityClass(): new () => WorkoutSessionPlanEntity {
        return WorkoutSessionPlanEntity;
    }
    protected get responseDtoClass(): new () => WorkoutSessionPlanResponseDto {
        return WorkoutSessionPlanResponseDto;
    }

    protected getEntityName(): string {
        return 'workout session plan';
    }

    protected beforeCreate(
        dto: WorkoutSessionPlanCreateDto,
        user: JwtAuthenticatedUser,
    ): void {
        void dto;
        void user;
    }

    protected beforeUpdate(
        dto: WorkoutSessionPlanUpdateDto | WorkoutSessionPlanPatchDto,
        entity: WorkoutSessionPlanEntity,
        user: JwtAuthenticatedUser,
    ): void {
        void dto;
        void entity;
        void user;
    }

    protected beforeDelete(
        entity: WorkoutSessionPlanEntity,
        user: JwtAuthenticatedUser,
    ): void {
        void entity;
        void user;
    }

    protected beforeRestore(
        entity: WorkoutSessionPlanEntity,
        user: JwtAuthenticatedUser,
    ): void {
        void entity;
        void user;
    }
}
