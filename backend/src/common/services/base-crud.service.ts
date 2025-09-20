import { DeepPartial } from 'typeorm';
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

    async create(entity: DeepPartial<Entity>): Promise<Entity> {
        return this.repository.save(entity);
    }

    async findAll(): Promise<Entity[]> {
        return this.repository.findActive();
    }

    async findOne(id: number): Promise<Entity> {
        const entity = await this.repository.findByIdActive(id);

        if (!entity) {
            throw new NotFoundException('Entity not found');
        }

        return entity;
    }

    async update(id: number, dto: UpdateDto | PatchDto): Promise<Entity> {
        const entity = await this.findOne(id);
        entity.updatedAt = new Date();
        Object.assign(entity, dto);
        return this.repository.save(entity);
    }

    async delete(id: number): Promise<void> {
        await this.repository.softDeleteById(id);
    }
}
