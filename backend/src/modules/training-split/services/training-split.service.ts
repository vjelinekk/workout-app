import { Injectable, NotFoundException } from '@nestjs/common';
import { PublicAuthorizableCrudService } from 'src/common/services/public-authorizable-crud.service';
import { TrainingSplitEntity } from '../entities/training-split.entity';
import { TrainingSplitCreateDto } from '../dtos/training-split/trainin-split-create.dto';
import { TrainingSplitUpdateDto } from '../dtos/training-split/training-split-update.dto';
import { TrainingSplitPatchDto } from '../dtos/training-split/training-split-patch.dto';
import { TrainingSplitResponseDto } from '../dtos/training-split/training-split-response.dto';
import { TrainingSplitRepository } from '../repositories/training-split.repository';
import { JwtAuthenticatedUser } from 'src/modules/auth/types/jwt-authenticated-user.type';
import { TrainingSplitAssignmentRepository } from '../repositories/training-split-assignment.repository';
import { TrainingSplitAssignmentStatusEnum } from '../enums/training-split-assignment-status.enum';
import { NoAssignedTrainingSplitException } from '../exceptions/no-assigned-training-split.exception';
import { WorkoutSessionPlanService } from 'src/modules/workout/services/workout-session-plan.service';
import { In } from 'typeorm';

/**
 * Training split service for managing workout splits and their assignments.
 * Extends PublicAuthorizableCrudService to handle public/private split visibility.
 * Manages access to training splits and their associated days and exercises.
 */
@Injectable()
export class TrainingSplitService extends PublicAuthorizableCrudService<
    TrainingSplitEntity,
    TrainingSplitCreateDto,
    TrainingSplitUpdateDto,
    TrainingSplitPatchDto,
    TrainingSplitResponseDto,
    TrainingSplitRepository
> {
    constructor(
        protected readonly trainingSplitRepository: TrainingSplitRepository,
        protected readonly trainingSplitAssignmentRepository: TrainingSplitAssignmentRepository,
        private readonly workoutSessionPlanService: WorkoutSessionPlanService,
    ) {
        super(trainingSplitRepository);
    }

    protected get entityClass(): new () => TrainingSplitEntity {
        return TrainingSplitEntity;
    }
    protected get responseDtoClass(): new () => TrainingSplitResponseDto {
        return TrainingSplitResponseDto;
    }

    protected getEntityName(): string {
        return 'Training Split';
    }

    protected beforeCreate(
        dto: TrainingSplitCreateDto,
        user: JwtAuthenticatedUser,
    ): Promise<void> | void {
        void dto;
        void user;
    }

    protected beforeUpdate(
        dto: TrainingSplitUpdateDto | TrainingSplitPatchDto,
        entity: TrainingSplitEntity,
        user: JwtAuthenticatedUser,
    ): Promise<void> | void {
        void dto;
        void entity;
        void user;
    }

    /**
     * After updating a training split, if it was just approved (isApproved changed to true),
     * cascade the approval to all related workout session plans.
     */
    protected async afterUpdate(
        entity: TrainingSplitEntity,
        user: JwtAuthenticatedUser,
    ): Promise<void> {
        void user;

        // Check if the training split is now approved
        if (entity.isApproved) {
            // Load the training split with all days to get workout session plan IDs
            const trainingSplitWithDays = await this.trainingSplitRepository.findByIdActive(
                entity.id,
                { days: true },
            );

            if (trainingSplitWithDays && trainingSplitWithDays.days.length > 0) {
                // Extract unique workout session plan IDs
                const workoutSessionPlanIds = Array.from(
                    new Set(
                        trainingSplitWithDays.days
                            .filter(day => day.workoutSessionPlanId)
                            .map(day => day.workoutSessionPlanId)
                    )
                );

                // Approve all related workout session plans (which will cascade to exercises)
                if (workoutSessionPlanIds.length > 0) {
                    await this.workoutSessionPlanService.approveMultiple(workoutSessionPlanIds);
                }
            }
        }
    }

    protected beforeDelete(
        entity: TrainingSplitEntity,
        user: JwtAuthenticatedUser,
    ): Promise<void> | void {
        void entity;
        void user;
    }

    protected beforeRestore(
        entity: TrainingSplitEntity,
        user: JwtAuthenticatedUser,
    ): Promise<void> | void {
        void entity;
        void user;
    }

    /**
     * Retrieves the currently active training split assigned to a trainee.
     * Eagerly loads all days and their associated exercises for complete plan information.
     *
     * @param id The ID of the trainee
     * @returns Training split response DTO with all days and exercises loaded
     * @throws NoAssignedTrainingSplitException if no active assignment exists for the trainee
     * @throws NotFoundException if the assigned training split record is missing
     */
    async findAssignedTrainingSplit(
        id: number,
    ): Promise<TrainingSplitResponseDto> {
        const trainingSplitAssignment =
            await this.trainingSplitAssignmentRepository.findOneActive({
                where: {
                    traineeId: id,
                    status: TrainingSplitAssignmentStatusEnum.ACTIVE,
                },
                relations: {
                    trainingSplit: {
                        days: {
                            workoutSessionPlan: {
                                exercises: {
                                    exercise: true,
                                },
                            },
                        },
                    },
                },
                order: {
                    trainingSplit: {
                        days: {
                            dayOfWeek: 'ASC',
                        }
                    }
                }
            });

        if (!trainingSplitAssignment) {
            throw new NoAssignedTrainingSplitException();
        }

        if (!trainingSplitAssignment.trainingSplit) {
            throw new NotFoundException('Assigned training split not found');
        }

        return this.toResponseDto(trainingSplitAssignment?.trainingSplit);
    }
}
