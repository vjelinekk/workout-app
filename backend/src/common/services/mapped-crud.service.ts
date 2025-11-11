import { DeepPartial, FindOptionsWhere } from 'typeorm';
import { BaseRepository } from '../repositories/base.repository';
import { BaseCrudService } from './base-crud.service';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { AuditableEntity } from '../entities/auditable.entity';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity.js';
import { plainToInstance } from 'class-transformer';

export abstract class MappedCrudService<
    Entity extends AuditableEntity,
    CreateDto,
    UpdateDto,
    PatchDto,
    ResponseDto,
    Repo extends BaseRepository<Entity>,
> extends BaseCrudService<Entity, UpdateDto, PatchDto, Repo> {
    constructor(protected readonly repository: Repo) {
        super(repository);
    }

    protected abstract get entityClass(): new () => Entity;
    protected abstract get responseDtoClass(): new () => ResponseDto;

    /**
     * Maps create DTO fields to entity fields for creation operations.
     * This method should handle the mapping between DTO field names and entity field names,
     * and can include additional logic like setting the creator ID.
     *
     * @param dto Create DTO containing the data for entity creation
     * @param loggedInUserId Optional ID of the currently logged-in user
     * @returns Partial entity with properly mapped fields ready for creation
     */
    protected toEntity(dto: CreateDto): DeepPartial<Entity> {
        return plainToInstance(this.entityClass, dto);
    }

    /**
     * Maps entity fields to response DTO fields for API responses.
     * This method should handle the mapping between entity field names and response DTO field names,
     * ensuring that the API response format matches the expected contract.
     *
     * @param entity Entity instance to be converted to response format
     * @returns Response DTO with properly mapped fields
     */
    protected toResponseDto(entity: Entity): ResponseDto {
        return plainToInstance(this.responseDtoClass, entity, {
            excludeExtraneousValues: true,
        });
    }

    /**
     * Maps update/patch DTO fields to entity fields.
     * This method should handle the mapping between DTO field names and entity field names.
     *
     * @param dto Update or patch DTO
     * @returns Partial entity with properly mapped fields
     */
    protected toEntityUpdate(dto: UpdateDto | PatchDto): Partial<Entity> {
        const instance = plainToInstance(this.entityClass, dto);

        // Create a strongly typed Partial<Entity> object
        const partial = {} as Partial<Entity>;

        (
            Object.entries(instance) as [keyof Entity, Entity[keyof Entity]][]
        ).forEach(([key, value]) => {
            if (value !== undefined) {
                partial[key] = value;
            }
        });

        return partial;
    }

    /**
     * Creates a new entity from the provided DTO and returns it as a response DTO.
     *
     * @param dto Data to create the entity from
     * @returns Created entity as response DTO
     */
    async createMapped(dto: CreateDto, userId: number): Promise<ResponseDto> {
        const entity = this.toEntity(dto);
        entity.createdById = userId;
        const createdEntity = await this.create(entity);
        return this.toResponseDto(createdEntity);
    }

    /**
     * Core update method that handles DTO-to-entity field mapping.
     * This method is protected and should be called by putMapped or patchMapped.
     *
     * @param id ID of entity to update
     * @param dto Data to update the entity with
     * @returns Updated entity as response DTO
     * @throws NotFoundException if the entity with the given ID does not exist
     */
    protected async updateMapped(
        id: number,
        dto: UpdateDto | PatchDto,
        userId: number,
    ): Promise<ResponseDto> {
        const entity = await this.findOneActive(id);

        // Map DTO fields to entity fields
        const mappedFields = this.toEntityUpdate(dto);

        // Update timestamp and apply mapped fields
        entity.updatedAt = new Date();
        entity.updatedById = userId;
        Object.assign(entity, mappedFields);

        // Save and return as response DTO
        const updatedEntity = await this.repository.save(entity);
        return this.toResponseDto(updatedEntity);
    }

    /**
     * Performs a full update (PUT operation) of an entity by its ID.
     * This operation is intended to replace the entire resource.
     *
     * @param id ID of entity to update
     * @param dto Complete update data
     * @returns Updated entity as response DTO
     * @throws NotFoundException if the entity with the given ID does not exist
     */
    async putMapped(
        id: number,
        dto: UpdateDto,
        userId: number,
    ): Promise<ResponseDto> {
        return this.updateMapped(id, dto, userId);
    }

    /**
     * Performs a partial update (PATCH operation) of an entity by its ID.
     * This operation only modifies the provided fields.
     *
     * @param id ID of entity to patch
     * @param dto Partial update data
     * @returns Updated entity as response DTO
     * @throws NotFoundException if the entity with the given ID does not exist
     */
    async patchMapped(
        id: number,
        dto: PatchDto,
        userId: number,
    ): Promise<ResponseDto> {
        return this.updateMapped(id, dto, userId);
    }

    /**
     * Deletes an entity by its ID and returns the deleted entity as a response DTO.
     *
     * @param id ID of entity to delete
     * @returns Deleted entity as response DTO
     * @throws NotFoundException if the entity with the given ID does not exist
     */
    async deleteMapped(id: number, userId: number): Promise<ResponseDto> {
        const updateResult = await this.repository.update(
            { id, isDeleted: false } as unknown as FindOptionsWhere<Entity>,
            {
                isDeleted: true,
                deletedById: userId,
            } as unknown as QueryDeepPartialEntity<Entity>,
        );

        if (updateResult.affected === 0) {
            throw new NotFoundException(
                `Entity with ID ${id} not found or already deleted`,
            );
        }

        // Re-fetch the entity to get its updated state (including isDeleted flag and timestamps)
        const deletedEntity = await this.repository.findOne({
            where: { id } as FindOptionsWhere<Entity>,
        });

        if (!deletedEntity) {
            throw new InternalServerErrorException(
                `Could not retrieve entity with ID ${id} after deletion.`,
            );
        }

        return this.toResponseDto(deletedEntity);
    }

    /**
     * Restores a soft-deleted entity by its ID and returns it as a response DTO.
     *
     * @param id ID of entity to restore
     * @returns Restored entity as response DTO
     * @throws NotFoundException if the entity with the given ID does not exist
     */
    async restoreMapped(id: number): Promise<ResponseDto> {
        // Perform the restore operation. The base `restore` method already checks for existence.
        await this.restore(id);

        // Re-fetch the now-active entity to get its fresh state
        const restoredEntity = await this.findOneActive(id);

        return this.toResponseDto(restoredEntity);
    }

    /**
     * Retrieves an entity by its ID and returns it as a response DTO.
     *
     * @param id ID of entity to retrieve
     * @returns Entity as response DTO
     * @throws NotFoundException if the entity with the given ID does not exist
     */
    async findByIdActiveMapped(id: number): Promise<ResponseDto> {
        const entity = await this.findOneActive(id);
        return this.toResponseDto(entity);
    }

    /**
     * Retrieves any entity (including soft-deleted) by ID.
     *
     * @param id ID of entity to retrieve
     * @returns Entity as response DTO
     * @throws NotFoundException if the entity with the given ID does not exist
     */
    async findByIdMapped(id: number): Promise<ResponseDto> {
        const entity = await this.repository.findOneBy({
            id,
        } as FindOptionsWhere<Entity>);

        if (!entity) {
            throw new NotFoundException(`Entity with ID ${id} not found`);
        }

        return this.toResponseDto(entity);
    }

    /**
     * Finds all entities.
     *
     * @returns All entities as response DTOs
     * @throws NotFoundException if no entities are found
     */
    async findAllMapped(): Promise<ResponseDto[]> {
        const entities = await this.repository.find();
        return entities.map((entity) => this.toResponseDto(entity));
    }

    /**
     * Retrieves all entities and returns them as response DTOs.
     *
     * @returns All entities as response DTOs
     * @throws NotFoundException if no entities are found
     */
    async findAllActiveMapped(): Promise<ResponseDto[]> {
        const entities = await this.findAllActive();
        return entities.map((entity) => this.toResponseDto(entity));
    }
}
