import { Injectable } from '@nestjs/common';
import { ValidatedMappedCrudService } from 'src/common/services/validated-mapped-crud.service';
import { TrainingSplitAssignmentEntity } from '../entities/training-split-assignment.entity';
import { TrainingSplitAssignmentCreateDto } from '../dtos/training-split-assignment/training-split-assignment-create.dto';
import { TrainingSplitAssignmentUpdateDto } from '../dtos/training-split-assignment/training-split-assignment-update.dto';
import { TrainingSplitAssignmentPatchDto } from '../dtos/training-split-assignment/training-split-assignment-patch.dto';
import { TrainingSplitAssignmentResponseDto } from '../dtos/training-split-assignment/training-split-assignment-response.dto';
import { TrainingSplitAssignmentRepository } from '../repositories/training-split-assignment.repository';
import { JwtAuthenticatedUser } from 'src/modules/auth/types/jwt-authenticated-user.type';
import { DeepPartial } from 'typeorm';
import { TrainingSplitAssignmentStatusEnum } from '../enums/training-split-assignment-status.enum';

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
    ) {
        super(trainingSplitAssignmentRepository);
    }

    protected validateEntityAccess(
        entity: TrainingSplitAssignmentEntity,
        user: JwtAuthenticatedUser,
    ): void | Promise<void> {
        void entity;
        void user;
    }

    protected beforeCreate(
        dto: TrainingSplitAssignmentCreateDto,
        user: JwtAuthenticatedUser,
    ): Promise<void> | void {
        void dto;
        void user;
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
            trainee: { id: dto.trainee_id },
            trainingSplit: { id: dto.training_split_id },
        };
    }

    protected toResponseDto(
        entity: TrainingSplitAssignmentEntity,
    ): TrainingSplitAssignmentResponseDto {
        return {
            id: entity.id,
            trainee_id: entity.traineeId,
            training_split_id: entity.trainingSplitId,
            assigned_by_id: entity.assignedById,
            status: entity.status,
            assigned_at: entity.assignedAt?.toISOString(),
            responded_at: entity.respondedAt?.toISOString(),
            created_by: entity.createdById,
            created_at: entity.createdAt,
            updated_at: entity.updatedAt,
            is_deleted: entity.isDeleted,
        };
    }

    protected toEntityUpdate(
        dto: TrainingSplitAssignmentUpdateDto | TrainingSplitAssignmentPatchDto,
    ): Partial<TrainingSplitAssignmentEntity> {
        const entityFields: Partial<TrainingSplitAssignmentEntity> = {};

        if ('trainee_id' in dto && dto.trainee_id !== undefined) {
            entityFields.trainee = { id: dto.trainee_id } as any;
        }
        if ('training_split_id' in dto && dto.training_split_id !== undefined) {
            entityFields.trainingSplit = { id: dto.training_split_id } as any;
        }
        if ('assigned_by_id' in dto && dto.assigned_by_id !== undefined) {
            entityFields.assignedBy = { id: dto.assigned_by_id } as any;
        }

        return entityFields;
    }

    async createMapped(dto: TrainingSplitAssignmentCreateDto, userId: number): Promise<TrainingSplitAssignmentResponseDto> {
        const entity = this.toEntity(dto);
        entity.createdById = userId;
        entity.status = TrainingSplitAssignmentStatusEnum.PENDING;
        entity.assignedAt = new Date();
        entity.assignedById = userId;

        const createdEntity = await this.create(entity);
        return this.toResponseDto(createdEntity);
    }
}
