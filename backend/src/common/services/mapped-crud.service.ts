import { DeepPartial } from 'typeorm';
import { BaseEntity } from '../entities/base.entity';
import { BaseRepository } from '../repositories/base.repository';
import { BaseCrudService } from './base-crud.service';
import { NotFoundException } from '@nestjs/common';

export abstract class MappedCrudService<
    Entity extends BaseEntity,
    CreateDto,
    UpdateDto,
    PatchDto,
    ResponseDto,
    Repo extends BaseRepository<Entity>,
> extends BaseCrudService<Entity, UpdateDto, PatchDto, Repo> {
    constructor(protected readonly repository: Repo) {
        super(repository);
    }

    protected abstract toEntity(
        dto: CreateDto,
        loggedInUserId?: number,
    ): DeepPartial<Entity>;
    protected abstract toResponseDto(entity: Entity): ResponseDto;

    /**
     * Creates a new entity from the provided DTO and returns it as a response DTO.
     *
     * @param dto Data to create the entity from
     * @param loggedInUserId ID of the logged-in user (optional)
     * @returns Created entity as response DTO
     */
    async createMapped(
        dto: CreateDto,
        loggedInUserId?: number,
    ): Promise<ResponseDto> {
        const entity = this.toEntity(dto, loggedInUserId);
        const createdEntity = await this.create(entity);
        return this.toResponseDto(createdEntity);
    }

    /**
     * Updates an entity by its ID using the provided DTO (either full update or partial update).
     *
     * @param id ID of entity to update
     * @param dto Data to update the entity with
     * @returns Updated entity as response DTO
     * @throws NotFoundException if the entity with the given ID does not exist
     */
    async updateMapped(
        id: number,
        dto: UpdateDto | PatchDto,
    ): Promise<ResponseDto> {
        const updatedEntity = await this.update(id, dto);
        return this.toResponseDto(updatedEntity);
    }

    /**
     * Retrieves an entity by its ID and returns it as a response DTO.
     *
     * @param id ID of entity to retrieve
     * @returns Entity as response DTO
     * @throws NotFoundException if the entity with the given ID does not exist
     */
    async findOneMapped(id: number): Promise<ResponseDto> {
        const entity = await this.findOne(id);

        if (!entity) {
            throw new NotFoundException(`Entity with ID ${id} not found`);
        }

        return this.toResponseDto(entity);
    }

    /**
     * Retrieves all entities and returns them as response DTOs.
     *
     * @returns All entities as response DTOs
     */
    async findAllMapped(): Promise<ResponseDto[]> {
        const entities = await this.findAll();
        return entities.map((entity) => this.toResponseDto(entity));
    }

    /**
     * Deletes an entity by its ID and returns the deleted entity as a response DTO.
     *
     * @param id ID of entity to delete
     * @returns Deleted entity as response DTO
     * @throws NotFoundException if the entity with the given ID does not exist
     */
    async deleteMapped(id: number): Promise<ResponseDto> {
        const entity = await this.findOne(id);

        if (!entity) {
            throw new NotFoundException(`Entity with ID ${id} not found`);
        }

        await this.delete(id);
        return this.toResponseDto(entity);
    }

    /**
     * Restores a soft-deleted entity by its ID and returns it as a response DTO.
     *
     * @param id ID of entity to restore
     * @returns Restored entity as response DTO
     * @throws NotFoundException if the entity with the given ID does not exist
     */
    async restoreMapped(id: number): Promise<ResponseDto> {
        const entity = await this.findOne(id);

        if (!entity) {
            throw new NotFoundException(`Entity with ID ${id} not found`);
        }

        await this.restore(id);
        return this.toResponseDto(entity);
    }
}
