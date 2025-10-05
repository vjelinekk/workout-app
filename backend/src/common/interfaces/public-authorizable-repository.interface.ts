import { AuditableEntity } from '../entities/auditable.entity';
import { BaseRepository } from '../repositories/base.repository';

export interface PublicAuthorizableEntity extends AuditableEntity {
    id: number;
    createdById: number;
    isPublic: boolean;
    isApproved: boolean;
}

export interface PublicAuthorizableRepository<
    T extends PublicAuthorizableEntity,
> extends BaseRepository<T> {
    /**
     * Finds all entities available to a specific user.
     * This includes:
     * - Public entities that are approved
     * - Private entities created by the user
     *
     * @param userId The ID of the user requesting access
     * @param isAdmin Whether the user has admin privileges
     * @returns Promise resolving to array of entities available to the user
     */
    findAllAvailable(userId: number, isAdmin: boolean): Promise<T[]>;

    /**
     * Finds a single entity available to a specific user.
     * This includes:
     * - Public entities that are approved
     * - Private entities created by the user
     *
     * @param userId The ID of the user requesting access
     * @param id The ID of the specific entity to find
     * @param isAdmin Whether the user has admin privileges
     * @returns Promise resolving to the entity if found and accessible, null otherwise
     */
    findOneAvailable(
        userId: number,
        id: number,
        isAdmin: boolean,
    ): Promise<T | null>;

    /**
     * Finds all entities created by a specific user (private entities owned by the user).
     *
     * @param userId The ID of the user who created the entities
     * @param isAdmin Whether the user has admin privileges
     * @returns Promise resolving to array of entities created by the user
     */
    findAllPrivate(userId: number, isAdmin: boolean): Promise<T[]>;

    /**
     * Finds a single entity created by a specific user (private entity owned by the user).
     *
     * @param userId The ID of the user who created the entity
     * @param id The ID of the specific entity to find
     * @param isAdmin Whether the user has admin privileges
     * @returns Promise resolving to the entity if found and owned by user, null otherwise
     */
    findOnePrivate(
        userId: number,
        id: number,
        isAdmin: boolean,
    ): Promise<T | null>;

    /**
     * Finds all entities that are public and approved.
     * These entities are visible to all users without authentication.
     *
     * @returns Promise resolving to array of public and approved entities
     */
    findAllPublicAndApproved(): Promise<T[]>;

    /**
     * Finds a single entity that is public and approved.
     * These entities are visible to all users without authentication.
     *
     * @param id The ID of the specific entity to find
     * @returns Promise resolving to the entity if found and public/approved, null otherwise
     */
    findOnePublicAndApproved(id: number): Promise<T | null>;

    /**
     * Finds all entities available to a specific user, including both active and deleted entities.
     * This includes:
     * - Public entities that are approved (active and deleted)
     * - Private entities created by the user (active and deleted)
     *
     * @param userId The ID of the user requesting access
     * @param isAdmin Whether the user has admin privileges
     * @returns Promise resolving to array of all entities available to the user
     */
    findAllAvailableIncludingDeleted(
        userId: number,
        isAdmin: boolean,
    ): Promise<T[]>;

    /**
     * Finds a single entity available to a specific user, including deleted entities.
     * This includes:
     * - Public entities that are approved (active and deleted)
     * - Private entities created by the user (active and deleted)
     *
     * @param userId The ID of the user requesting access
     * @param id The ID of the specific entity to find
     * @param isAdmin Whether the user has admin privileges
     * @returns Promise resolving to the entity if found and accessible, null otherwise
     */
    findOneAvailableIncludingDeleted(
        userId: number,
        id: number,
        isAdmin: boolean,
    ): Promise<T | null>;

    /**
     * Finds all deleted entities available to a specific user.
     * This includes:
     * - Public entities that are approved and deleted
     * - Private entities created by the user and deleted
     *
     * @param userId The ID of the user requesting access
     * @param isAdmin Whether the user has admin privileges
     * @returns Promise resolving to array of deleted entities available to the user
     */
    findAllDeletedAvailable(userId: number, isAdmin: boolean): Promise<T[]>;

    /**
     * Finds a single deleted entity available to a specific user.
     * This includes:
     * - Public entities that are approved and deleted
     * - Private entities created by the user and deleted
     *
     * @param userId The ID of the user requesting access
     * @param id The ID of the specific entity to find
     * @param isAdmin Whether the user has admin privileges
     * @returns Promise resolving to the deleted entity if found and accessible, null otherwise
     */
    findOneDeletedAvailable(
        userId: number,
        id: number,
        isAdmin: boolean,
    ): Promise<T | null>;
}
