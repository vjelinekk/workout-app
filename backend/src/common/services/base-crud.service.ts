import { DeepPartial, FindOptionsWhere, FindOptionsRelations } from 'typeorm';
import { BaseEntity } from '../entities/base.entity';
import { BaseRepository } from '../repositories/base.repository';
import { NotFoundException } from '@nestjs/common';

export abstract class BaseCrudService<
    Entity extends BaseEntity,
    UpdateDto,
    PatchDto,
    Repo extends BaseRepository<Entity>,
> {
    constructor(protected readonly repository: Repo) {}

    /**
     * Creates a new entity from the provided partial entity data.
     *
     * @param entity Entity to create
     * @returns Created entity
     */
    async create(entity: DeepPartial<Entity>): Promise<Entity> {
        return this.repository.save(entity);
    }

    /**
     * Retrieves all entities.
     *
     * @returns All entities
     */
    async findAllActive(): Promise<Entity[]> {
        const entities = await this.repository.findActive();

        return entities;
    }

    /**
     * Retrieves an entity by its ID.
     *
     * @param id ID of entity to retrieve
     * @param relations Optional relations to eagerly load
     * @returns Entity
     * @throws NotFoundException if the entity with the given ID does not exist
     */
    async findOneActive(
        id: number,
        relations?: FindOptionsRelations<Entity>,
    ): Promise<Entity> {
        const entity = await this.repository.findByIdActive(id, relations);

        if (!entity) {
            throw new NotFoundException(`Entity with ID ${id} not found`);
        }

        return entity;
    }

    /**
     * Retrieves a soft-deleted entity by its ID.
     *
     * @param id ID of entity to retrieve
     * @param relations Optional relations to eagerly load
     * @returns Entity
     * @throws NotFoundException if the entity with the given ID does not exist
     */
    async findOneInDeleted(
        id: number,
        relations?: FindOptionsRelations<Entity>,
    ): Promise<Entity> {
        const entity = await this.repository.findOne({
            where: {
                id,
                isDeleted: true,
            } as FindOptionsWhere<Entity>,
            relations,
        });

        if (!entity) {
            throw new NotFoundException(`Entity with ID ${id} not found`);
        }

        return entity;
    }

    /**
     * Finds all deleted entities.
     *
     * @returns Array of all deleted entities
     * @throws NotFoundException if no deleted entities are found
     */
    async findAllDeleted(): Promise<Entity[]> {
        const entities = await this.repository.findBy({
            isDeleted: true,
        } as FindOptionsWhere<Entity>);

        if (entities.length === 0) {
            throw new NotFoundException('No deleted entities found');
        }

        return entities;
    }

    /**
     * Updates an entity by its ID using the provided DTO (either full update or partial update).
     *
     * @param id ID of entity to update
     * @param dto Data to update the entity with
     * @returns Updated entity
     * @throws NotFoundException if the entity with the given ID does not exist
     */
    protected async update(
        id: number,
        dto: UpdateDto | PatchDto,
    ): Promise<Entity> {
        const entity = await this.findOneActive(id);

        if (!entity) {
            throw new NotFoundException(
                `Entity with ID ${id} not found for update`,
            );
        }

        entity.updatedAt = new Date();
        Object.assign(entity, dto);
        return this.repository.save(entity);
    }

    /**
     * Performs a full update (PUT operation) of an entity by its ID.
     * This operation is intended to replace the entire resource.
     *
     * @param id ID of entity to update
     * @param dto Complete update data
     * @returns Updated entity
     * @throws NotFoundException if the entity with the given ID does not exist
     */
    async put(id: number, dto: UpdateDto): Promise<Entity> {
        return this.update(id, dto);
    }

    /**
     * Performs a partial update (PATCH operation) of an entity by its ID.
     * This operation only modifies the provided fields.
     *
     * @param id ID of entity to patch
     * @param dto Partial update data
     * @returns Updated entity
     * @throws NotFoundException if the entity with the given ID does not exist
     */
    async patch(id: number, dto: PatchDto): Promise<Entity> {
        return this.update(id, dto);
    }

    /**
     * Deletes an entity by its ID.
     *
     * @param id ID of entity to delete
     * @throws NotFoundException if the entity with the given ID does not exist
     */
    async delete(id: number): Promise<void> {
        const success = await this.repository.softDeleteById(id);

        if (!success) {
            throw new NotFoundException(
                `Entity with ID ${id} not found for deletion`,
            );
        }
    }

    /**
     * Restores a soft-deleted entity by its ID.
     *
     * @param id ID of entity to restore
     * @throws NotFoundException if the entity with the given ID does not exist
     */
    async restore(id: number): Promise<void> {
        const success = await this.repository.restoreById(id);

        if (!success) {
            throw new NotFoundException(
                `Entity with ID ${id} not found for restoration`,
            );
        }
    }
}
