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
import { FindOptionsRelations } from 'typeorm';

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

            case FindAllScopes.WAITING_FOR_APPROVAL:
                return this.repository.findAllWaitingForApproval();

            default:
                return this.repository.findAllAvailableIncludingDeleted(
                    userId,
                    isAdmin,
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
     * Finds all entities available for the user with pagination support.
     *
     * @param userId ID of the user making the request
     * @param userRoles Array of roles the user has
     * @param scope The scope of access being requested
     * @param offset Number of records to skip
     * @param limit Number of records to return
     * @returns Array of response DTOs representing the paginated entities
     */
    async findAllAvailableAuthorizedPaginated(
        userId: number,
        userRoles: RoleEnum[],
        scope: FindAllScopes,
        offset: number = 0,
        limit: number = 20,
    ): Promise<ResponseDto[]> {
        const isAdmin = this.isAdmin(userRoles);

        let entities: Entity[];
        switch (scope) {
            case FindAllScopes.AVAILABLE:
                entities = await this.repository.findAllAvailablePaginated(
                    userId,
                    isAdmin,
                    offset,
                    limit,
                );
                break;
            case FindAllScopes.MY:
                entities = await this.repository.findAllPrivatePaginated(
                    userId,
                    isAdmin,
                    offset,
                    limit,
                );
                break;
            case FindAllScopes.PUBLIC:
                // Public scope doesn't use pagination by default, but we can add it
                entities = await this.repository.findAllPublicAndApproved();
                entities = entities.slice(offset, offset + limit);
                break;
            case FindAllScopes.ALL:
            case FindAllScopes.DELETED:
            default: {
                // For ALL and DELETED, use the non-paginated version for now
                const allEntities = await this.findAllByScope(
                    userId,
                    userRoles,
                    scope,
                );
                entities = allEntities.slice(offset, offset + limit);
                break;
            }
        }

        return entities.map((entity) => this.toResponseDto(entity));
    }

    /**
     * Finds a single entity by ID and validates user access.
     *
     * @param userId The ID of the user making the request
     * @param userRoles The roles of the user making the request
     * @param id The ID of the entity to retrieve
     * @param relations Optional relations to eagerly load
     * @returns The entity as a response DTO
     * @throws NotFoundException if the entity is not found
     * @throws UnauthorizedException if the user doesn't have permission to access the entity
     * @throws ForbiddenException if trying to modify a publicly approved entity without admin role
     */
    async findOneAvailableAuthorized(
        userId: number,
        userRoles: RoleEnum[],
        id: number,
        relations?: FindOptionsRelations<Entity>,
    ): Promise<ResponseDto> {
        const entity = await this.repository.findByIdActive(id, relations);

        if (!entity) {
            throw new NotFoundException(`${this.getEntityName()} not found`);
        }

        this.validateEntityAccess(entity, { id: userId, roles: userRoles } as JwtAuthenticatedUser);

        return this.toResponseDto(entity);
    }
}
