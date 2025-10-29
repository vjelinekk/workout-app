import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { ValidatedMappedCrudService } from 'src/common/services/validated-mapped-crud.service';
import { TrainingSplitAssignmentEntity } from '../entities/training-split-assignment.entity';
import { TrainingSplitAssignmentCreateDto } from '../dtos/training-split-assignment/training-split-assignment-create.dto';
import { TrainingSplitAssignmentUpdateDto } from '../dtos/training-split-assignment/training-split-assignment-update.dto';
import { TrainingSplitAssignmentPatchDto } from '../dtos/training-split-assignment/training-split-assignment-patch.dto';
import { TrainingSplitAssignmentResponseDto } from '../dtos/training-split-assignment/training-split-assignment-response.dto';
import { TrainingSplitAssignmentRepository } from '../repositories/training-split-assignment.repository';
import { JwtAuthenticatedUser } from 'src/modules/auth/types/jwt-authenticated-user.type';
import { DeepPartial, In } from 'typeorm';
import { TrainingSplitAssignmentStatusEnum } from '../enums/training-split-assignment-status.enum';
import { TrainingSplitAlreadyPendingOrActiveException } from '../exceptions/training-split-already-pending-or-active.exception';
import { TrainerTraineeRepository } from 'src/modules/user/repositories/trainer-trainee.repository';
import { TrainerTraineeStatusEnum } from 'src/modules/user/enums/trainer-trainee-status.enum';

@Injectable()
export class TrainingSplitAssignmentService extends ValidatedMappedCrudService<
    TrainingSplitAssignmentEntity,
    TrainingSplitAssignmentCreateDto,
    TrainingSplitAssignmentUpdateDto,
    TrainingSplitAssignmentPatchDto,
    TrainingSplitAssignmentResponseDto,
    TrainingSplitAssignmentRepository
> {
    constructor(
        protected readonly trainingSplitAssignmentRepository: TrainingSplitAssignmentRepository,
        protected readonly trainerTraineeRepository: TrainerTraineeRepository,
    ) {
        super(trainingSplitAssignmentRepository);
    }

    protected get entityClass(): new () => TrainingSplitAssignmentEntity {
        return TrainingSplitAssignmentEntity;
    }
    protected get responseDtoClass(): new () => TrainingSplitAssignmentResponseDto {
        return TrainingSplitAssignmentResponseDto;
    }

    protected validateEntityAccess(
        entity: TrainingSplitAssignmentEntity,
        user: JwtAuthenticatedUser,
    ): void | Promise<void> {
        void entity;
        void user;
    }

    protected async beforeCreate(
        dto: TrainingSplitAssignmentCreateDto,
        user: JwtAuthenticatedUser,
    ): Promise<void> {
        void user;

        const traineeId = dto.traineeId;
        const trainingSplitId = dto.trainingSplitId;

        const isTrainingSplitAlreadyPendingOrActive =
            await this.trainingSplitAssignmentRepository.exists({
                where: {
                    traineeId: traineeId,
                    trainingSplitId: trainingSplitId,
                    status: In([
                        TrainingSplitAssignmentStatusEnum.PENDING,
                        TrainingSplitAssignmentStatusEnum.ACTIVE,
                    ]),
                },
            });

        if (isTrainingSplitAlreadyPendingOrActive) {
            throw new TrainingSplitAlreadyPendingOrActiveException();
        }
    }

    protected beforeUpdate(
        dto: TrainingSplitAssignmentUpdateDto | TrainingSplitAssignmentPatchDto,
        entity: TrainingSplitAssignmentEntity,
        user: JwtAuthenticatedUser,
    ): Promise<void> | void {
        void dto;
        void entity;
        void user;
    }

    protected beforeDelete(
        entity: TrainingSplitAssignmentEntity,
        user: JwtAuthenticatedUser,
    ): Promise<void> | void {
        void entity;
        void user;
    }

    protected beforeRestore(
        entity: TrainingSplitAssignmentEntity,
        user: JwtAuthenticatedUser,
    ): Promise<void> | void {
        void entity;
        void user;
    }

    protected toEntity(
        dto: TrainingSplitAssignmentCreateDto,
    ): DeepPartial<TrainingSplitAssignmentEntity> {
        return {
            trainee: { id: dto.traineeId },
            trainingSplit: { id: dto.trainingSplitId },
        };
    }

    private deactivateCurrentActiveAssignmentForUser = async (
        userId: number,
    ) => {
        await this.trainingSplitAssignmentRepository.update(
            {
                traineeId: userId,
                status: TrainingSplitAssignmentStatusEnum.ACTIVE,
            },
            {
                status: TrainingSplitAssignmentStatusEnum.ACCEPTED,
            },
        );
    };

    async createValidated(
        dto: TrainingSplitAssignmentCreateDto,
        user: JwtAuthenticatedUser,
    ): Promise<TrainingSplitAssignmentResponseDto> {
        await this.beforeCreate(dto, user);

        const entity = this.toEntity(dto);

        if (dto.traineeId === user.id) {
            entity.status = TrainingSplitAssignmentStatusEnum.ACTIVE;
            await this.deactivateCurrentActiveAssignmentForUser(user.id);
        } else {
            entity.status = TrainingSplitAssignmentStatusEnum.PENDING;
        }

        entity.createdById = user.id;
        entity.assignedById = user.id;
        entity.assignedAt = new Date();

        const createdEntity = await this.create(entity);
        return this.toResponseDto(createdEntity);
    }

    async findAllActiveForUserMapped(
        userId: number,
        statuses?: TrainingSplitAssignmentStatusEnum[],
    ): Promise<TrainingSplitAssignmentResponseDto[]> {
        const currentTrainer =
            await this.trainerTraineeRepository.findOneActive({
                where: {
                    traineeId: userId,
                    status: TrainerTraineeStatusEnum.ACTIVE,
                },
            });

        if (!currentTrainer) {
            return [];
        }

        const result = await this.trainingSplitAssignmentRepository.findActive({
            where: {
                traineeId: userId,
                assignedById: currentTrainer.trainerId,
                status: statuses ? In(statuses) : undefined,
            },
            relations: {
                trainingSplit: true,
            },
        });

        return result.map((entity) => this.toResponseDto(entity));
    }

    async resolveAssignment(
        id: number,
        accept: boolean,
        user: JwtAuthenticatedUser,
    ) {
        const assignment =
            await this.trainingSplitAssignmentRepository.findByIdActive(id);

        if (!assignment) {
            throw new NotFoundException('Training split assignment not found');
        }

        if (assignment.traineeId !== user.id) {
            throw new UnauthorizedException(
                'You are not authorized to resolve this assignment',
            );
        }

        if (assignment.status !== TrainingSplitAssignmentStatusEnum.PENDING) {
            throw new BadRequestException(
                'Only pending assignments can be resolved',
            );
        }

        assignment.status = accept
            ? TrainingSplitAssignmentStatusEnum.ACTIVE
            : TrainingSplitAssignmentStatusEnum.DECLINED;
        assignment.respondedAt = new Date();

        if (accept) {
            await this.deactivateCurrentActiveAssignmentForUser(user.id);
        }

        await this.trainingSplitAssignmentRepository.save(assignment);
    }
}
