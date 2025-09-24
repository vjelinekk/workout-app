import { RoleEnum } from 'src/modules/user/enums/role.enum';
import { FindAllScopes } from '../enums/find-all-scopes.enum';
import { MappedCrudService } from './mapped-crud.service';
import {
    ForbiddenException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { PublicAuthorizableEntity } from '../interfaces/public-authorizable-repository.interface';
import { PublicAuthorizableBaseRepository } from '../repositories/public-authorizable-base.repository';
import { isArray } from 'class-validator';

export abstract class PublicAuthorizableCrudService<
    Entity extends PublicAuthorizableEntity,
    CreateDto,
    UpdateDto,
    PatchDto,
    ResponseDto,
    Repository extends PublicAuthorizableBaseRepository<Entity>,
> extends MappedCrudService<
    Entity,
    CreateDto,
    UpdateDto,
    PatchDto,
    ResponseDto,
    Repository
> {
    /**
     * Gets the name of the entity for error messages.
     */
    protected abstract getEntityName(): string;

    /**
     * Checks if the user has admin privileges.
     *
     * @param userRoles Array of roles the user has
     * @returns True if the user has admin privileges, false otherwise
     */
    isAdmin(userRoles: RoleEnum[]): boolean {
        return userRoles.includes(RoleEnum.ADMIN);
    }

    /**
     * Validates if a user has permission to modify a public entity.
     *
     * @param entity An entity to check ownership of
     * @param userId ID of the user to check ownership against
     * @returns True if the user is the owner of the entity, false otherwise
     */
    isOwner<T extends PublicAuthorizableEntity>(
        entity: T,
        userId: number,
    ): boolean {
        return entity.createdById === userId;
    }

    /**
     *
     * @param entity Entity to validate
     * @param userId ID of the user making the request
     * @param userRoles Roles of the user making the request
     * @param action The action being performed (update, delete, restore)
     * @throws ForbiddenException if the entity is public and approved
     * @throws UnauthorizedException if the user is not the owner or an admin
     */
    validateModificationPermission<T extends PublicAuthorizableEntity>(
        entity: T,
        userId: number,
        userRoles: RoleEnum[],
        action: 'update' | 'delete' | 'restore',
    ): void {
        if (entity.isPublic && entity.isApproved) {
            throw new ForbiddenException(
                `Cannot ${action} ${this.getEntityName()} that is publicly visible to other users`,
            );
        }

        if (!this.isOwner(entity, userId) && !this.isAdmin(userRoles)) {
            throw new UnauthorizedException(
                `Only the owner or an admin can ${action} this ${this.getEntityName()}.`,
            );
        }
    }

    /**
     * Validates if the user has access to the specified entity.
     *
     * @param userId ID of the user making the request
     * @param userRoles Array of roles the user has
     * @param scope The scope of access being requested
     * @param id (Optional) ID of the specific entity to retrieve
     * @returns The entity or entities if found, otherwise null
     */
    private async findByScope(
        userId: number,
        userRoles: RoleEnum[],
        scope: FindAllScopes,
        id?: number,
    ): Promise<Entity | Entity[] | null> {
        switch (scope) {
            case FindAllScopes.AVAILABLE:
                return id
                    ? await this.repository.findOneAvailable(
                          userId,
                          id,
                          this.isAdmin(userRoles),
                      )
                    : await this.repository.findAllAvailable(
                          userId,
                          this.isAdmin(userRoles),
                      );

            case FindAllScopes.MY:
                return id
                    ? await this.repository.findOnePrivate(
                          userId,
                          id,
                          this.isAdmin(userRoles),
                      )
                    : await this.repository.findAllPrivate(
                          userId,
                          this.isAdmin(userRoles),
                      );

            case FindAllScopes.PUBLIC:
                return id
                    ? await this.repository.findOnePublicAndApproved(id)
                    : await this.repository.findAllPublicAndApproved();

            case FindAllScopes.ALL:
                return id
                    ? await this.repository.findOneAvailableIncludingDeleted(
                          userId,
                          id,
                          this.isAdmin(userRoles),
                      )
                    : await this.repository.findAllAvailableIncludingDeleted(
                          userId,
                          this.isAdmin(userRoles),
                      );

            case FindAllScopes.DELETED:
                return id
                    ? await this.repository.findOneDeletedAvailable(
                          userId,
                          id,
                          this.isAdmin(userRoles),
                      )
                    : await this.repository.findAllDeletedAvailable(
                          userId,
                          this.isAdmin(userRoles),
                      );

            default:
                return id
                    ? await this.repository.findOneAvailableIncludingDeleted(
                          userId,
                          id,
                          this.isAdmin(userRoles),
                      )
                    : await this.repository.findAllAvailableIncludingDeleted(
                          userId,
                          this.isAdmin(userRoles),
                      );
        }
    }

    /**
     * Finds all entities available for the user based on their roles and the requested scope.
     *
     * @param userId ID of the user making the request
     * @param userRoles Array of roles the user has
     * @param scope The scope of access being requested
     * @returns Array of response DTOs representing the entities
     * @throws NotFoundException if no entities are found
     */
    async findAllAvailableAuthorized(
        userId: number,
        userRoles: RoleEnum[],
        scope: FindAllScopes,
    ): Promise<ResponseDto[]> {
        const entities = (await this.findByScope(
            userId,
            userRoles,
            scope,
        )) as Entity[];

        if (!entities || (isArray(entities) && entities.length === 0)) {
            throw new NotFoundException(`No ${this.getEntityName()} found`);
        }

        return entities.map((entity) => this.toResponseDto(entity));
    }

    /**
     * Finds a entity based on the user's role, the specified scope, and the plan ID.
     *
     * @param userId The ID of the user making the request
     * @param userRoles The roles of the user making the request
     * @param scope The scope of the request (e.g., ALL, AVAILABLE, MY, PUBLIC)
     * @param id The ID of the entity to retrieve
     * @returns The entity as a response DTO
     * @throws NotFoundException if the entity is not found or the user does not have permission to access it
     */
    async findOneAvailableAuthorized(
        userId: number,
        userRoles: RoleEnum[],
        scope: FindAllScopes,
        id: number,
    ): Promise<ResponseDto> {
        const entity = (await this.findByScope(
            userId,
            userRoles,
            scope,
            id,
        )) as Entity | null;

        if (!entity) {
            throw new NotFoundException(`${this.getEntityName()} not found`);
        }

        return this.toResponseDto(entity);
    }

    /**
     * Finds a entity based on the user's role, the specified scope, and the plan ID.
     *
     * @param id The ID of the entity to update
     * @param dto The data to update the entity with
     * @param userId ID of the user making the request
     * @param userRoles Roles of the user making the request
     * @returns The updated entity as a response DTO
     * @throws NotFoundException if the entity is not found
     * @throws UnauthorizedException if the user does not have permission to update the entity
     */
    async updateMappedAuthorized(
        id: number,
        dto: UpdateDto | PatchDto,
        userId: number,
        userRoles: RoleEnum[],
    ): Promise<ResponseDto> {
        const entity = await this.findOneActive(id);

        if (!entity) {
            throw new NotFoundException(`${this.getEntityName()} not found`);
        }

        this.validateModificationPermission(
            entity,
            userId,
            userRoles,
            'update',
        );

        Object.assign(entity, dto);

        return this.updateMapped(id, dto);
    }

    /**
     * Deletes an entity with user permission validation.
     *
     * @param id The ID of the entity to delete
     * @param userId The ID of the user making the request
     * @param userRoles The roles of the user making the request
     * @returns The deleted entity as a response DTO
     * @throws NotFoundException if the entity is not found
     * @throws UnauthorizedException if the user does not have permission to delete the entity
     */
    async deleteMappedAuthorized(
        id: number,
        userId: number,
        userRoles: RoleEnum[],
    ): Promise<ResponseDto> {
        const entity = await this.findOneActive(id);

        if (!entity) {
            throw new NotFoundException(`${this.getEntityName()} not found`);
        }

        this.validateModificationPermission(
            entity,
            userId,
            userRoles,
            'delete',
        );

        return this.deleteMapped(id);
    }

    /**
     * Restores a deleted entity for a user.
     *
     * @param id ID of the entity to restore
     * @param userId ID of the user making the request
     * @param userRoles Roles of the user making the request
     * @returns The restored entity as a response DTO
     * @throws NotFoundException if the entity is not found
     * @throws UnauthorizedException if the user does not have permission to restore the entity
     */
    async restoreMappedAuthorized(
        id: number,
        userId: number,
        userRoles: RoleEnum[],
    ): Promise<ResponseDto> {
        const entity = await this.findOneInDeleted(id);

        if (!entity) {
            throw new NotFoundException(`${this.getEntityName()} not found`);
        }

        this.validateModificationPermission(
            entity,
            userId,
            userRoles,
            'restore',
        );

        return await this.restoreMapped(id);
    }
}
