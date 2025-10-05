import { Injectable } from "@nestjs/common";
import { PublicAuthorizableCrudService } from "src/common/services/public-authorizable-crud.service";
import { TrainingSplitEntity } from "../entities/training-split.entity";
import { TrainingSplitCreateDto } from "../dtos/training-split/trainin-split-create.dto";
import { TrainingSplitUpdateDto } from "../dtos/training-split/training-split-update.dto";
import { TrainingSplitPatchDto } from "../dtos/training-split/training-split-patch.dto";
import { TrainingSplitResponseDto } from "../dtos/training-split/training-split-response.dto";
import { TrainingSplitRepository } from "../repositories/training-split.repository";
import { JwtAuthenticatedUser } from "src/modules/auth/types/jwt-authenticated-user.type";
import { DeepPartial } from "typeorm";

@Injectable()
export class TrainingSplitService extends PublicAuthorizableCrudService<
    TrainingSplitEntity,
    TrainingSplitCreateDto,
    TrainingSplitUpdateDto,
    TrainingSplitPatchDto,
    TrainingSplitResponseDto,
    TrainingSplitRepository
> {
    constructor(protected readonly trainingSplitRepository: TrainingSplitRepository) {
        super(trainingSplitRepository);
    }

    protected getEntityName(): string {
        return 'Training Split';
    }

    protected beforeCreate(dto: TrainingSplitCreateDto, user: JwtAuthenticatedUser): Promise<void> | void {
        void dto;
        void user;
    }

    protected beforeUpdate(dto: TrainingSplitUpdateDto | TrainingSplitPatchDto, entity: TrainingSplitEntity, user: JwtAuthenticatedUser): Promise<void> | void {
        void dto;
        void entity;
        void user;
    }

    protected beforeDelete(entity: TrainingSplitEntity, user: JwtAuthenticatedUser): Promise<void> | void {
        void entity;
        void user;
    }

    protected beforeRestore(entity: TrainingSplitEntity, user: JwtAuthenticatedUser): Promise<void> | void {
        void entity;
        void user;
    }

    protected toEntity(dto: TrainingSplitCreateDto): DeepPartial<TrainingSplitEntity> {
        return {
            name: dto.name,
            description: dto.description,
            isPublic: dto.is_public,
            isApproved: dto.is_approved,
        }
    }

    protected toResponseDto(entity: TrainingSplitEntity): TrainingSplitResponseDto {
        return {
            id: entity.id,
            name: entity.name,
            description: entity.description,
            is_public: entity.isPublic,
            is_approved: entity.isApproved,
            created_by: entity.createdById,
            created_at: entity.createdAt,
            updated_at: entity.updatedAt,
            is_deleted: entity.isDeleted,
        }
    }

    protected toEntityUpdate(dto: TrainingSplitUpdateDto | TrainingSplitPatchDto): Partial<TrainingSplitEntity> {
        const entityFields: Partial<TrainingSplitEntity> = {};

        if ('name' in dto && dto.name !== undefined) {
            entityFields.name = dto.name;
        }
        if ('description' in dto && dto.description !== undefined) {
            entityFields.description = dto.description;
        }
        if ('is_public' in dto && dto.is_public !== undefined) {
            entityFields.isPublic = dto.is_public;
        }
        if ('is_approved' in dto && dto.is_approved !== undefined) {
            entityFields.isApproved = dto.is_approved;
        }

        return entityFields;
    }
}