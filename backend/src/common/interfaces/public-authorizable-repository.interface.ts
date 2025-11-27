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
     * Finds all entities created by a specific user (private entities owned by the user).
     *
     * @param userId The ID of the user who created the entities
     * @param isAdmin Whether the user has admin privileges
     * @returns Promise resolving to array of entities created by the user
     */
    findAllPrivate(userId: number, isAdmin: boolean): Promise<T[]>;

    /**
     * Finds all entities that are public and approved.
     * These entities are visible to all users without authentication.
     *
     * @returns Promise resolving to array of public and approved entities
     */
    findAllPublicAndApproved(): Promise<T[]>;

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
     * Finds all entities that are public but waiting for approval.
     * These entities are visible only to admins for review.
     *
     * @returns Promise resolving to array of entities waiting for approval
     */
    findAllWaitingForApproval(): Promise<T[]>;
}
