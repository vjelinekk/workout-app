import { WorkoutSessionPlanEntity } from '../entities/workout-session-plan.entity';
import { WorkoutSessionPlanCreateDto } from '../dtos/workout-session-plan/workout-session-plan-create.dto';
import { WorkoutSessionPlanUpdateDto } from '../dtos/workout-session-plan/workout-session-plan-update.dto';
import { WorkoutSessionPlanPatchDto } from '../dtos/workout-session-plan/workout-session-plan-patch.dto';
import { WorkoutSessionPlanResponseDto } from '../dtos/workout-session-plan/workout-session-plan-response.dto';
import { WorkoutSessionPlanRepository } from '../repositories/workout-session-plan.repository';
import { Injectable } from '@nestjs/common';
import { PublicAuthorizableCrudService } from 'src/common/services/public-authorizable-crud.service';
import { JwtAuthenticatedUser } from 'src/modules/auth/types/jwt-authenticated-user.type';
import { ExerciseService } from 'src/modules/exercise/services/exercise.service';
import { In } from 'typeorm';

/**
 * Workout session plan service for managing workout plan templates.
 * Provides CRUD operations for reusable workout plans with public/private visibility.
 * Manages plan templates that are used to generate actual workout sessions.
 */
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
        private readonly exerciseService: ExerciseService,
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

    /**
     * After updating a workout session plan, if it was just approved (isApproved changed to true),
     * cascade the approval to all related exercises.
     */
    protected async afterUpdate(
        entity: WorkoutSessionPlanEntity,
        user: JwtAuthenticatedUser,
    ): Promise<void> {
        void user;

        // Check if the workout session plan is now approved
        if (entity.isApproved) {
            // Load the workout session plan with all exercises to get exercise IDs
            const planWithExercises =
                await this.workoutSessionPlanRepository.findByIdActive(
                    entity.id,
                    { exercises: true },
                );

            if (planWithExercises && planWithExercises.exercises.length > 0) {
                // Extract unique exercise IDs
                const exerciseIds = Array.from(
                    new Set(
                        planWithExercises.exercises
                            .filter((ex) => ex.exerciseId)
                            .map((ex) => ex.exerciseId),
                    ),
                );

                // Approve all related exercises
                if (exerciseIds.length > 0) {
                    await this.exerciseService.approveMultiple(exerciseIds);
                }
            }
        }
    }

    /**
     * Approves multiple workout session plans by their IDs.
     * This is used for cascading approval from training splits.
     *
     * @param ids Array of workout session plan IDs to approve
     */
    async approveMultiple(ids: number[]): Promise<void> {
        if (ids.length === 0) {
            return;
        }

        // Update all workout session plans to set isApproved = true
        await this.workoutSessionPlanRepository.update(
            { id: In(ids) },
            { isApproved: true },
        );

        // For each approved plan, cascade approval to exercises
        for (const id of ids) {
            const planWithExercises =
                await this.workoutSessionPlanRepository.findByIdActive(id, {
                    exercises: true,
                });

            if (planWithExercises && planWithExercises.exercises.length > 0) {
                const exerciseIds = Array.from(
                    new Set(
                        planWithExercises.exercises
                            .filter((ex) => ex.exerciseId)
                            .map((ex) => ex.exerciseId),
                    ),
                );

                if (exerciseIds.length > 0) {
                    await this.exerciseService.approveMultiple(exerciseIds);
                }
            }
        }
    }
}
