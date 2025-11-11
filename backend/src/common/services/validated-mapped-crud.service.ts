import { JwtAuthenticatedUser } from 'src/modules/auth/types/jwt-authenticated-user.type';
import { AuditableEntity } from '../entities/auditable.entity';
import { BaseRepository } from '../repositories/base.repository';
import { MappedCrudService } from './mapped-crud.service';
import { FindOptionsWhere, FindOptionsRelations } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity.js';
import { NotFoundException } from '@nestjs/common';

export abstract class ValidatedMappedCrudService<
    Entity extends AuditableEntity,
    CreateDto,
    UpdateDto,
    PatchDto,
    ResponseDto,
    Repo extends BaseRepository<Entity>,
> extends MappedCrudService<
    Entity,
    CreateDto,
    UpdateDto,
    PatchDto,
    ResponseDto,
    Repo
> {
    /**
     * Specifies which relations should be eager-loaded when fetching entities for validation.
     * These relations will be loaded before validateEntityAccess() is called, eliminating N+1 queries.
     *
     * Override this method in subclasses to specify relations needed for access validation.
     * Return undefined or empty object to load no relations (maintains current behavior).
     *
     * @returns FindOptionsRelations object specifying relations to load, or undefined for no relations
     *
     * @example
     * ```typescript
     * protected getValidationRelations(): FindOptionsRelations<TrainingSplitDayEntity> {
     *   return {
     *     trainingSplit: true,
     *     workoutSessionPlan: true
     *   };
     * }
     * ```
     */
    protected getValidationRelations(): FindOptionsRelations<Entity> | undefined {
        return undefined; // Default: no relations loaded
    }

    /**
     * Validates whether the authenticated user has access to the specified entity.
     * This hook is called before any operation that requires entity access (read, update, delete, restore).
     * Should throw an exception if the user doesn't have permission to access the entity.
     *
     * Implement this method to define custom access control logic.
     * Leave empty if no access validation is needed.
     *
     * @param entity The entity being accessed
     * @param user The authenticated user making the request
     * @throws Should throw an appropriate exception if access is denied
     */
    protected abstract validateEntityAccess(
        entity: Entity,
        user: JwtAuthenticatedUser,
    ): Promise<void> | void;

    /**
     * Validates the data and user permissions before creating a new entity.
     * This hook is called before the entity creation process begins.
     * Can be used to validate business rules, check permissions, or verify data constraints.
     *
     * Implement this method to define custom creation validation logic.
     * Leave empty if no validation is needed.
     *
     * @param dto The create DTO containing the data for the new entity
     * @param user Optional authenticated user making the request (may be undefined for public endpoints)
     * @throws Should throw an appropriate exception if validation fails
     */
    protected abstract beforeCreate(
        dto: CreateDto,
        user: JwtAuthenticatedUser,
    ): Promise<void> | void;

    /**
     * Validates the data and user permissions before updating an existing entity.
     * This hook is called before both PUT (full update) and PATCH (partial update) operations.
     * Can be used to validate business rules, check permissions, or verify data constraints.
     * Has access to both the update data and the existing entity for comparison.
     *
     * Implement this method to define custom update validation logic.
     * Leave empty if no validation is needed.
     *
     * @param dto The update/patch DTO containing the new data
     * @param entity The existing entity being updated
     * @param user Optional authenticated user making the request (may be undefined for public endpoints)
     * @throws Should throw an appropriate exception if validation fails
     */
    protected abstract beforeUpdate(
        dto: UpdateDto | PatchDto,
        entity: Entity,
        user: JwtAuthenticatedUser,
    ): Promise<void> | void;

    /**
     * Validates user permissions and business rules before soft-deleting an entity.
     * This hook is called before the soft delete operation.
     * Can be used to check if the entity can be deleted, verify user permissions,
     * or validate cascading delete constraints.
     *
     * Implement this method to define custom deletion validation logic.
     * Leave empty if no validation is needed.
     *
     * @param entity The entity being soft-deleted
     * @param user Optional authenticated user making the request (may be undefined for public endpoints)
     * @throws Should throw an appropriate exception if deletion is not allowed
     */
    protected abstract beforeDelete(
        entity: Entity,
        user: JwtAuthenticatedUser,
    ): Promise<void> | void;

    /**
     * Validates user permissions and business rules before restoring a soft-deleted entity.
     * This hook is called before the restore operation.
     * Can be used to check if the entity can be restored, verify user permissions,
     * or validate that restoration won't violate any constraints.
     *
     * Implement this method to define custom restoration validation logic.
     * Leave empty if no validation is needed.
     *
     * @param entity The soft-deleted entity being restored
     * @param user Optional authenticated user making the request (may be undefined for public endpoints)
     * @throws Should throw an appropriate exception if restoration is not allowed
     */
    protected abstract beforeRestore(
        entity: Entity,
        user: JwtAuthenticatedUser,
    ): Promise<void> | void;

    /**
     * Creates a new entity with validation and access control.
     * This method enforces authentication and runs all validation hooks.
     *
     * @param dto Data to create the entity from
     * @param user Authenticated user making the request (required)
     * @returns Created entity as response DTO
     */
    async createValidated(
        dto: CreateDto,
        user: JwtAuthenticatedUser,
    ): Promise<ResponseDto> {
        await this.beforeCreate(dto, user);

        const entity = this.toEntity(dto);
        entity.createdById = user.id;
        const createdEntity = await this.create(entity);
        return this.toResponseDto(createdEntity);
    }

    /**
     * Core validated update method that handles access control and validation.
     * This method is protected and should be called by putMappedValidated or patchMappedValidated.
     *
     * @param id ID of entity to update
     * @param dto Data to update the entity with
     * @param user Authenticated user making the request (required)
     * @returns Updated entity as response DTO
     * @throws NotFoundException if the entity with the given ID does not exist
     * @throws ForbiddenException if user doesn't have access (via validateEntityAccess)
     */
    protected async updateValidated(
        id: number,
        dto: UpdateDto | PatchDto,
        user: JwtAuthenticatedUser,
    ): Promise<ResponseDto> {
        const relations = this.getValidationRelations();
        const entity = await this.findOneActive(id, relations);

        await this.validateEntityAccess(entity, user);
        await this.beforeUpdate(dto, entity, user);

        return this.updateMapped(id, dto, user.id);
    }

    /**
     * Performs a full update (PUT operation) with validation and access control.
     * This method enforces authentication and runs all validation hooks.
     *
     * @param id ID of entity to update
     * @param dto Complete update data
     * @param user Authenticated user making the request (required)
     * @returns Updated entity as response DTO
     * @throws NotFoundException if the entity with the given ID does not exist
     * @throws ForbiddenException if user doesn't have access (via validateEntityAccess)
     */
    async putValidated(
        id: number,
        dto: UpdateDto,
        user: JwtAuthenticatedUser,
    ): Promise<ResponseDto> {
        return this.updateValidated(id, dto, user);
    }

    /**
     * Performs a partial update (PATCH operation) with validation and access control.
     * This method enforces authentication and runs all validation hooks.
     *
     * @param id ID of entity to patch
     * @param dto Partial update data
     * @param user Authenticated user making the request (required)
     * @returns Updated entity as response DTO
     * @throws NotFoundException if the entity with the given ID does not exist
     * @throws ForbiddenException if user doesn't have access (via validateEntityAccess)
     */
    async patchValidated(
        id: number,
        dto: PatchDto,
        user: JwtAuthenticatedUser,
    ): Promise<ResponseDto> {
        return this.updateValidated(id, dto, user);
    }

    /**
     * Deletes an entity with validation and access control.
     * This method enforces authentication and runs all validation hooks.
     *
     * @param id ID of entity to delete
     * @param user Authenticated user making the request (required)
     * @returns Deleted entity as response DTO
     * @throws NotFoundException if the entity with the given ID does not exist
     * @throws ForbiddenException if user doesn't have access (via validateEntityAccess)
     */
    async deleteValidated(
        id: number,
        user: JwtAuthenticatedUser,
    ): Promise<ResponseDto> {
        const relations = this.getValidationRelations();
        const entityToValidate = await this.findOneActive(id, relations);

        await this.validateEntityAccess(entityToValidate, user);
        await this.beforeDelete(entityToValidate, user);

        const updateResult = await this.repository.update(
            { id } as unknown as FindOptionsWhere<Entity>,
            {
                isDeleted: true,
                deletedById: user.id,
            } as unknown as QueryDeepPartialEntity<Entity>,
        );

        if (updateResult.affected === 0) {
            throw new NotFoundException(`Entity with ID ${id} not found`);
        }

        // Re-fetch the entity to get its updated state
        const deletedEntity = await this.repository.findOne({
            where: { id } as FindOptionsWhere<Entity>,
            relations,
        });

        if (!deletedEntity) {
            throw new NotFoundException(
                `Could not retrieve entity with ID ${id} after deletion.`,
            );
        }

        return this.toResponseDto(deletedEntity);
    }

    /**
     * Restores a soft-deleted entity with validation and access control.
     * This method enforces authentication and runs all validation hooks.
     *
     * @param id ID of entity to restore
     * @param user Authenticated user making the request (required)
     * @returns Restored entity as response DTO
     * @throws NotFoundException if the entity with the given ID does not exist
     * @throws ForbiddenException if user doesn't have access (via validateEntityAccess)
     */
    async restoreValidated(
        id: number,
        user: JwtAuthenticatedUser,
    ): Promise<ResponseDto> {
        const relations = this.getValidationRelations();
        const entityToValidate = await this.findOneInDeleted(id, relations);

        await this.validateEntityAccess(entityToValidate, user);
        await this.beforeRestore(entityToValidate, user);

        // Perform the restore operation
        await this.restore(id);

        // Re-fetch the now-active entity to get its fresh state
        const restoredEntity = await this.findOneActive(id, relations);

        return this.toResponseDto(restoredEntity);
    }

    /**
     * Retrieves an entity by ID with access validation.
     * This method validates that the user has permission to access the entity.
     *
     * @param id ID of entity to retrieve
     * @param user Authenticated user making the request (required)
     * @returns Entity as response DTO
     * @throws NotFoundException if entity not found
     * @throws ForbiddenException if user doesn't have access (via validateEntityAccess)
     */
    async findByIdActiveValidated(
        id: number,
        user: JwtAuthenticatedUser,
    ): Promise<ResponseDto> {
        const relations = this.getValidationRelations();
        const entity = await this.findOneActive(id, relations);
        await this.validateEntityAccess(entity, user);
        return this.toResponseDto(entity);
    }

    /**
     * Retrieves any entity (including soft-deleted) by ID with access validation.
     *
     * @param id ID of entity to retrieve
     * @param user Authenticated user making the request (required)
     * @returns Entity as response DTO
     * @throws NotFoundException if entity not found
     * @throws ForbiddenException if user doesn't have access (via validateEntityAccess)
     */
    async findByIdValidated(
        id: number,
        user: JwtAuthenticatedUser,
    ): Promise<ResponseDto> {
        const relations = this.getValidationRelations();
        const entity = await this.repository.findOne({
            where: {
                id,
            } as FindOptionsWhere<Entity>,
            relations,
        });

        if (!entity) {
            throw new NotFoundException(`Entity with ID ${id} not found`);
        }

        await this.validateEntityAccess(entity, user);

        return this.toResponseDto(entity);
    }
}
