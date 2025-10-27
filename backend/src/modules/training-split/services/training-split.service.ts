import { Injectable } from '@nestjs/common';
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

    async findAssignedTrainingSplit(
        id: number,
    ): Promise<TrainingSplitResponseDto> {
        const trainingSplit =
            await this.trainingSplitAssignmentRepository.findOneActive({
                where: {
                    traineeId: id,
                    status: TrainingSplitAssignmentStatusEnum.ACTIVE,
                },
                relations: [
                    'trainingSplit',
                    'trainingSplit.days',
                    'trainingSplit.days.workoutSessionPlan',
                    'trainingSplit.days.workoutSessionPlan.exercises',
                    'trainingSplit.days.workoutSessionPlan.exercises.exercise',
                ],
            });

        if (!trainingSplit) {
            // TODO: error handling
            throw new Error('No assigned training split found');
        }

        if (!trainingSplit.trainingSplit) {
            // TODO: error handling
            throw new Error('Assigned training split not found');
        }

        return this.toResponseDto(trainingSplit?.trainingSplit);
    }
}
