import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExerciseRepository } from '../repositories/exercise.repository';
import { ExerciseCreateDto } from '../dtos/exercise/exercise-create.dto';
import { ExerciseEntity } from '../entities/exercise.entity';
import { ExerciseResponseDto } from '../dtos/exercise/exercise-response.dto';
import { ExercisePatchDto } from '../dtos/exercise/exercise-patch.dto';
import { ExerciseUpdateDto } from '../dtos/exercise/exercise-update.dto';
import { DeepPartial } from 'typeorm';
import { PublicAuthorizableCrudService } from 'src/common/services/public-authorizable-crud.service';
import { JwtAuthenticatedUser } from 'src/modules/auth/types/jwt-authenticated-user.type';
import { RoleEnum } from 'src/modules/user/enums/role.enum';

@Injectable()
export class ExerciseService extends PublicAuthorizableCrudService<
    ExerciseEntity,
    ExerciseCreateDto,
    ExerciseUpdateDto,
    ExercisePatchDto,
    ExerciseResponseDto,
    ExerciseRepository
> {
    constructor(protected readonly exerciseRepository: ExerciseRepository) {
        super(exerciseRepository);
    }

    protected getEntityName(): string {
        return 'Exercise';
    }

    protected toEntity(dto: ExerciseCreateDto): DeepPartial<ExerciseEntity> {
        return {
            name: dto.name,
            bodyPart: dto.body_part,
            equipment: dto.equipment,
            description: dto.description,
            categoryId: dto.category_id,
            imageUrl: dto.image_url,
            isPublic: dto.is_public,
            isApproved: dto.is_approved,
        };
    }

    protected toEntityUpdate(
        dto: ExerciseUpdateDto | ExercisePatchDto,
    ): Partial<ExerciseEntity> {
        const entityFields: Partial<ExerciseEntity> = {};

        if ('name' in dto && dto.name !== undefined) {
            entityFields.name = dto.name;
        }
        if ('body_part' in dto && dto.body_part !== undefined) {
            entityFields.bodyPart = dto.body_part;
        }
        if ('equipment' in dto && dto.equipment !== undefined) {
            entityFields.equipment = dto.equipment;
        }
        if ('description' in dto && dto.description !== undefined) {
            entityFields.description = dto.description;
        }
        if ('image_url' in dto && dto.image_url !== undefined) {
            entityFields.imageUrl = dto.image_url;
        }
        if ('is_public' in dto && dto.is_public !== undefined) {
            entityFields.isPublic = dto.is_public;
        }
        if ('is_approved' in dto && dto.is_approved !== undefined) {
            entityFields.isApproved = dto.is_approved;
        }
        if ('category_id' in dto && dto.category_id !== undefined) {
            entityFields.categoryId = dto.category_id;
        }

        return entityFields;
    }

    protected toResponseDto(entity: ExerciseEntity): ExerciseResponseDto {
        return {
            id: entity.id,
            name: entity.name,
            body_part: entity.bodyPart,
            equipment: entity.equipment,
            description: entity.description,
            image_url: entity.imageUrl,
            is_public: entity.isPublic,
            is_approved: entity.isApproved,
            category_id: entity.categoryId,
            created_at: entity.createdAt,
            updated_at: entity.updatedAt,
            created_by: entity.createdById,
            is_deleted: entity.isDeleted,
        };
    }

    protected beforeCreate(
        dto: ExerciseCreateDto,
        user: JwtAuthenticatedUser,
    ): void {
        if (dto.is_approved && !user.roles.includes(RoleEnum.ADMIN)) {
            throw new UnauthorizedException(
                'Only admins can create approved exercises.',
            );
        }
    }

    protected beforeUpdate(
        dto: ExerciseUpdateDto | ExercisePatchDto,
        entity: ExerciseEntity,
        user: JwtAuthenticatedUser,
    ): void {
        void dto;
        void entity;
        void user;
    }

    protected beforeDelete(
        entity: ExerciseEntity,
        user: JwtAuthenticatedUser,
    ): void {
        void entity;
        void user;
    }

    protected beforeRestore(
        entity: ExerciseEntity,
        user: JwtAuthenticatedUser,
    ): void {
        void entity;
        void user;
    }
}
