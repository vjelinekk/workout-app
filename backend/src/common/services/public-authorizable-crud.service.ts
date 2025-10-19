import { RoleEnum } from 'src/modules/user/enums/role.enum';
import { FindAllScopes } from '../enums/find-all-scopes.enum';
import {
    ForbiddenException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { PublicAuthorizableEntity } from '../interfaces/public-authorizable-repository.interface';
import { PublicAuthorizableBaseRepository } from '../repositories/public-authorizable-base.repository';
import { JwtAuthenticatedUser } from 'src/modules/auth/types/jwt-authenticated-user.type';
import { ValidatedMappedCrudService } from './validated-mapped-crud.service';

export abstract class PublicAuthorizableCrudService<
    Entity extends PublicAuthorizableEntity,
    CreateDto,
    UpdateDto,
    PatchDto,
    ResponseDto,
    Repository extends PublicAuthorizableBaseRepository<Entity>,
> extends ValidatedMappedCrudService<
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

    protected validateEntityAccess(
        entity: PublicAuthorizableEntity,
        user: JwtAuthenticatedUser,
    ): void {
        if (entity.isPublic && entity.isApproved && !this.isAdmin(user.roles)) {
            throw new ForbiddenException(
                `Cannot access ${this.getEntityName()} that is publicly visible to other users`,
            );
        }

        if (!this.isOwner(entity, user.id) && !this.isAdmin(user.roles)) {
            throw new UnauthorizedException(
                `Only the owner or an admin can access this ${this.getEntityName()}.`,
            );
        }
    }

    /**
     * Finds all entities based on the specified scope.
     *
     * @param userId ID of the user making the request
     * @param userRoles Array of roles the user has
     * @param scope The scope of access being requested
     * @returns Array of entities matching the scope
     */
    private async findAllByScope(
        userId: number,
        userRoles: RoleEnum[],
        scope: FindAllScopes,
    ): Promise<Entity[]> {
        const isAdmin = this.isAdmin(userRoles);

        switch (scope) {
            case FindAllScopes.AVAILABLE:
                return this.repository.findAllAvailable(userId, isAdmin);

            case FindAllScopes.MY:
                return this.repository.findAllPrivate(userId, isAdmin);

            case FindAllScopes.PUBLIC:
                return this.repository.findAllPublicAndApproved();

            case FindAllScopes.ALL:
                return this.repository.findAllAvailableIncludingDeleted(
                    userId,
                    isAdmin,
                );

            case FindAllScopes.DELETED:
                return this.repository.findAllDeletedAvailable(userId, isAdmin);

            default:
                return this.repository.findAllAvailableIncludingDeleted(
                    userId,
                    isAdmin,
                );
        }
    }

    /**
     * Finds a single entity based on the specified scope.
     *
     * @param userId ID of the user making the request
     * @param userRoles Array of roles the user has
     * @param scope The scope of access being requested
     * @param id ID of the entity to retrieve
     * @returns The entity if found, null otherwise
     */
    private async findOneByScope(
        userId: number,
        userRoles: RoleEnum[],
        scope: FindAllScopes,
        id: number,
        relations?: string[],
    ): Promise<Entity | null> {
        const isAdmin = this.isAdmin(userRoles);

        switch (scope) {
            case FindAllScopes.AVAILABLE:
                return this.repository.findOneAvailable(
                    userId,
                    id,
                    isAdmin,
                    relations,
                );

            case FindAllScopes.MY:
                return this.repository.findOnePrivate(
                    userId,
                    id,
                    isAdmin,
                    relations,
                );

            case FindAllScopes.PUBLIC:
                return this.repository.findOnePublicAndApproved(id, relations);

            case FindAllScopes.ALL:
                return this.repository.findOneAvailableIncludingDeleted(
                    userId,
                    id,
                    isAdmin,
                    relations,
                );

            case FindAllScopes.DELETED:
                return this.repository.findOneDeletedAvailable(
                    userId,
                    id,
                    isAdmin,
                    relations,
                );

            default:
                return this.repository.findOneAvailableIncludingDeleted(
                    userId,
                    id,
                    isAdmin,
                    relations,
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
     */
    async findAllAvailableAuthorized(
        userId: number,
        userRoles: RoleEnum[],
        scope: FindAllScopes,
    ): Promise<ResponseDto[]> {
        const entities = await this.findAllByScope(userId, userRoles, scope);
        return entities.map((entity) => this.toResponseDto(entity));
    }

    /**
     * Finds a single entity based on the user's role, the specified scope, and the entity ID.
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
        relations?: string[],
    ): Promise<ResponseDto> {
        const entity = await this.findOneByScope(
            userId,
            userRoles,
            scope,
            id,
            relations,
        );

        if (!entity) {
            throw new NotFoundException(`${this.getEntityName()} not found`);
        }

        return this.toResponseDto(entity);
    }
}
