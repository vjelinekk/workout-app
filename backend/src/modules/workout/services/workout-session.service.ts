import { ValidatedMappedCrudService } from 'src/common/services/validated-mapped-crud.service';
import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { WorkoutSessionCreateDto } from '../dtos/workout-session/workout-session-create.dto';
import { WorkoutSessionUpdateDto } from '../dtos/workout-session/workout-session-update.dto';
import { WorkoutSessionPatchDto } from '../dtos/workout-session/workout-session-patch.dto';
import { WorkoutSessionResponseDto } from '../dtos/workout-session/workout-session-response.dto';
import { WorkoutSessionEntity } from '../entities/workout-session.entity';
import { WorkoutSessionRepository } from '../repositories/workout-session.respository';
import { JwtAuthenticatedUser } from 'src/modules/auth/types/jwt-authenticated-user.type';
import { WorkoutSessionExerciseRepository } from '../repositories/workout-session-exercise.respository';
import { WorkoutSessionPlanRepository } from '../repositories/workout-session-plan.repository';
import { WorkoutSessionExerciseEntity } from '../entities/workout-session-exercise.entity';
import { WorkoutSessionPlanEntity } from '../entities/workout-session-plan.entity';
import { WorkoutSessionStatusEnum } from '../enums/workout-session-status.enum';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity.js';
import { WorkoutSessionLogProgressDto } from '../dtos/workout-session/workout-session-log-progess.dto';
import { DataSource } from 'typeorm';

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
        protected readonly workoutSessionExerciseRepository: WorkoutSessionExerciseRepository,
        protected readonly workoutSessionPlanRepository: WorkoutSessionPlanRepository,
        private readonly dataSource: DataSource,
    ) {
        super(workoutSessionRepository);
    }

    protected validateEntityAccess(
        entity: WorkoutSessionEntity,
        user: JwtAuthenticatedUser,
    ): Promise<void> | void {
        void entity;
        void user;
    }

    protected beforeCreate(
        dto: WorkoutSessionCreateDto,
        user: JwtAuthenticatedUser,
    ): Promise<void> | void {
        void user;
        void dto;
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

    protected get entityClass(): new () => WorkoutSessionEntity {
        return WorkoutSessionEntity;
    }

    protected get responseDtoClass(): new () => WorkoutSessionResponseDto {
        return WorkoutSessionResponseDto;
    }

    private async findPreviousWorkoutSession(
        workoutSessionPlanId: number,
    ): Promise<WorkoutSessionEntity | null> {
        const result = await this.workoutSessionRepository.findActive({
            where: {
                workoutSessionPlanId: workoutSessionPlanId,
                status: WorkoutSessionStatusEnum.COMPLETED,
            },
            order: {
                startedAt: 'DESC',
            },
            relations: {
                exercises: true,
            },
        });

        if (result.length === 0) {
            return null;
        }

        return result[0];
    }

    private async findPreviousRepsAndWeights(
        workoutSessionPlanId: number,
    ): Promise<{
        [exerciseId: number]: {
            repsPerSet: number[];
            weightPerSet: number[];
        };
    }> {
        const previousWorkoutSession =
            await this.findPreviousWorkoutSession(workoutSessionPlanId);

        if (!previousWorkoutSession) {
            return {};
        }

        const previousExercises = previousWorkoutSession.exercises;

        const result: {
            [exerciseId: number]: {
                repsPerSet: number[];
                weightPerSet: number[];
            };
        } = {};

        for (const exercise of previousExercises) {
            const numbersOnlyReps = exercise.actualRepsPerSet.filter(
                (rep): rep is number => typeof rep === 'number',
            );
            const numbersOnlyWeights = exercise.actualWeightPerSet.filter(
                (weight): weight is number => typeof weight === 'number',
            );

            result[exercise.exerciseId] = {
                repsPerSet: numbersOnlyReps,
                weightPerSet: numbersOnlyWeights,
            };
        }

        return result;
    }

    private async createExercisesForSession(
        workoutSessionId: number,
        workoutSessionPlanId: number,
        userId: number,
    ): Promise<{
        savedSessionExercises: WorkoutSessionExerciseEntity[];
        workoutSessionPlan: WorkoutSessionPlanEntity;
    }> {
        const workoutSessionPlan =
            await this.workoutSessionPlanRepository.findByIdActive(
                workoutSessionPlanId,
                {
                    exercises: true,
                },
            );

        if (!workoutSessionPlan) {
            throw new NotFoundException(`Workout session plan not found`);
        }

        const workoutSessionPlanExercises = workoutSessionPlan.exercises;

        const sessionExerciseEntities: Partial<WorkoutSessionExerciseEntity>[] =
            workoutSessionPlanExercises.map((exercise) => ({
                workoutSessionId,
                exerciseId: exercise.exerciseId,
                order: exercise.order,
                actualRepsPerSet: Array(exercise.plannedRepsPerSet.length).fill(
                    null,
                ),
                actualWeightPerSet: Array(
                    exercise.plannedRepsPerSet.length,
                ).fill(null),
                createdById: userId,
            }));

        const savedSessionExercises =
            await this.workoutSessionExerciseRepository.save(
                sessionExerciseEntities,
            );

        return {
            savedSessionExercises,
            workoutSessionPlan,
        };
    }

    private async addPreviousRepsAndWeightsToExercises(
        responseDto: WorkoutSessionResponseDto,
    ): Promise<void> {
        const previousRepsAndWeights = await this.findPreviousRepsAndWeights(
            responseDto.workoutSessionPlanId,
        );

        for (const exercise of responseDto.exercises) {
            const previousData = previousRepsAndWeights[exercise.exerciseId];
            if (previousData) {
                exercise.previousRepsPerSet = previousData.repsPerSet;
                exercise.previousWeightPerSet = previousData.weightPerSet;
            } else {
                exercise.previousRepsPerSet = null;
                exercise.previousWeightPerSet = null;
            }
        }
    }

    async startWorkoutSession(
        dto: WorkoutSessionCreateDto,
        userId: number,
    ): Promise<WorkoutSessionResponseDto> {
        return await this.dataSource.transaction(async () => {
            const workoutSessionsInProgress =
                await this.workoutSessionRepository.findOneActive({
                    where: {
                        createdById: userId,
                        status: WorkoutSessionStatusEnum.IN_PROGRESS,
                    },
                });

            if (workoutSessionsInProgress) {
                throw new BadRequestException(
                    'Cannot start a new workout session while another is in progress',
                );
            }

            const entity = this.toEntity(dto);

            entity.createdById = userId;
            entity.startedAt = new Date();

            const workoutSession = await this.create(entity);

            const workoutSessionId = workoutSession.id;
            const { savedSessionExercises, workoutSessionPlan } =
                await this.createExercisesForSession(
                    workoutSessionId,
                    dto.workoutSessionPlanId,
                    userId,
                );

            workoutSession.exercises = savedSessionExercises;
            workoutSession.workoutSessionPlan = workoutSessionPlan;

            const responseDto = this.toResponseDto(workoutSession);

            await this.addPreviousRepsAndWeightsToExercises(responseDto);

            return responseDto;
        })
    }

    async getWorkoutSessionById(
        id: number,
    ): Promise<WorkoutSessionResponseDto> {
        const workoutSession =
            await this.workoutSessionRepository.findByIdActive(id, {
                exercises: {
                    exercise: true,
                },
                workoutSessionPlan: true,
            });

        if (!workoutSession) {
            throw new NotFoundException('Workout session not found');
        }

        const responseDto = this.toResponseDto(workoutSession);

        await this.addPreviousRepsAndWeightsToExercises(responseDto);

        return responseDto;
    }

    async logWorkoutSessionProgress(
        logProgressDto: WorkoutSessionLogProgressDto,
        workoutSessionId: number,
        userId: number,
        finish: boolean = false,
    ): Promise<void> {
        // Fetch and validate workout session outside transaction (read-only validation)
        const workoutSession =
            await this.workoutSessionRepository.findByIdActive(
                workoutSessionId,
                {
                    exercises: true,
                },
            );

        if (!workoutSession) {
            throw new NotFoundException('Workout session not found');
        }

        if (workoutSession.createdById !== userId) {
            throw new NotFoundException('Workout session not found');
        }

        if (workoutSession.status === WorkoutSessionStatusEnum.COMPLETED) {
            throw new NotFoundException(
                'Cannot log progress for a completed workout session',
            );
        }

        // Use transaction for all write operations
        await this.dataSource.transaction(async (manager) => {
            // Get repositories from transaction manager
            const workoutSessionRepo = manager.getRepository(WorkoutSessionEntity);
            const workoutSessionExerciseRepo = manager.getRepository(WorkoutSessionExerciseEntity);

            // 1. Update workout session status and metadata
            const baseValueUpdate: QueryDeepPartialEntity<WorkoutSessionEntity> = {
                updatedById: userId,
                updatedAt: () => 'NOW()', // database-side timestamp
            };

            if (finish) {
                baseValueUpdate.status = WorkoutSessionStatusEnum.COMPLETED;
                baseValueUpdate.finishedAt = () => 'NOW()';
                baseValueUpdate.performedById = userId;
            }

            await workoutSessionRepo.update(
                workoutSessionId,
                baseValueUpdate,
            );

            // 2. Update exercise progress
            const workoutSessionExercises = workoutSession.exercises;

            for (const exercise of workoutSessionExercises) {
                const exerciseProgress = logProgressDto.progressData[exercise.id];

                if (exerciseProgress) {
                    const newReps = Object.values(exerciseProgress).map(
                        (set) => set.reps ?? 0,
                    );
                    const newWeights = Object.values(exerciseProgress).map(
                        (set) => set.weight ?? 0,
                    );

                    const updatedReps = exercise.actualRepsPerSet.map(
                        (rep, index) => {
                            return newReps[index] !== undefined
                                ? newReps[index]
                                : rep;
                        },
                    );
                    const updatedWeights = exercise.actualWeightPerSet.map(
                        (weight, index) => {
                            return newWeights[index] !== undefined
                                ? newWeights[index]
                                : weight;
                        },
                    );

                    exercise.actualRepsPerSet = updatedReps;
                    exercise.actualWeightPerSet = updatedWeights;
                }
            }

            // 3. Save all exercise updates
            await workoutSessionExerciseRepo.save(
                workoutSessionExercises,
            );
        });
    }

    async finishWorkoutSession(
        finishDto: WorkoutSessionLogProgressDto,
        id: number,
        userId: number,
    ) {
        await this.logWorkoutSessionProgress(finishDto, id, userId, true);
    }

    async getWorkoutSessionInProgress(
        userId: number,
    ): Promise<WorkoutSessionResponseDto> {
        const workoutSession =
            await this.workoutSessionRepository.findOneActive({
                where: {
                    createdById: userId,
                    status: WorkoutSessionStatusEnum.IN_PROGRESS,
                },
                relations: {
                    exercises: {
                        exercise: true,
                    },
                    workoutSessionPlan: true,
                },
            });

        if (!workoutSession) {
            throw new NotFoundException('Workout session not found');
        }

        if (workoutSession.status !== WorkoutSessionStatusEnum.IN_PROGRESS) {
            throw new BadRequestException('Workout session is not in progress');
        }

        const responseDto = this.toResponseDto(workoutSession);

        await this.addPreviousRepsAndWeightsToExercises(responseDto);

        return responseDto;
    }

    async syncWorkoutSessionTime(userId: number): Promise<void> {
        const workoutSession =
            await this.workoutSessionRepository.findOneActive({
                where: {
                    createdById: userId,
                    status: WorkoutSessionStatusEnum.IN_PROGRESS,
                },
            });

        if (!workoutSession) {
            throw new NotFoundException(
                'No active workout session found to sync time',
            );
        }

        const now = new Date();
        workoutSession.updatedAt = now;

        if (!workoutSession.startedAt) {
            workoutSession.startedAt = now;
        }

        workoutSession.durationSeconds = Math.floor(
            (now.getTime() - workoutSession.startedAt.getTime()) / 1000,
        );

        await this.workoutSessionRepository.save(workoutSession);
    }
}
