import { DeepPartial } from 'typeorm';
import { BaseEntity } from '../entities/base.entity';
import { BaseRepository } from '../repositories/base.repository';
import { BaseCrudService } from './base-crud.service';

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

    async createMapped(
        dto: CreateDto,
        loggedInUserId?: number,
    ): Promise<ResponseDto> {
        const entity = this.toEntity(dto, loggedInUserId);
        const createdEntity = await this.create(entity);
        return this.toResponseDto(createdEntity);
    }

    async updateMapped(
        id: number,
        dto: UpdateDto | PatchDto,
    ): Promise<ResponseDto> {
        const updatedEntity = await this.update(id, dto);
        return this.toResponseDto(updatedEntity);
    }

    async findOneMapped(id: number): Promise<ResponseDto> {
        const entity = await this.findOne(id);
        return this.toResponseDto(entity);
    }

    async findAllMapped(): Promise<ResponseDto[]> {
        const entities = await this.findAll();
        return entities.map((entity) => this.toResponseDto(entity));
    }
}
