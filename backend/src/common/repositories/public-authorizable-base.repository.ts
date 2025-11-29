import { BaseRepository } from './base.repository';
import {
    PublicAuthorizableEntity,
    PublicAuthorizableRepository,
} from '../interfaces/public-authorizable-repository.interface';
import { FindManyOptions } from 'typeorm';

export abstract class PublicAuthorizableBaseRepository<
        T extends PublicAuthorizableEntity,
    >
    extends BaseRepository<T>
    implements PublicAuthorizableRepository<T>
{
    async findAllPrivate(userId: number): Promise<T[]> {
        const where = { createdById: userId } as FindManyOptions<T>['where'];

        return this.findActive({
            where,
        });
    }

    async findAllPrivatePaginated(
        userId: number,
        isAdmin: boolean,
        offset: number = 0,
        limit: number = 20,
    ): Promise<T[]> {
        let where = { createdById: userId } as FindManyOptions<T>['where'];
        if (isAdmin) {
            where = undefined;
        }

        return this.findActivePaginated(offset, limit, {
            where,
        });
    }

    async findAllAvailable(userId: number): Promise<T[]> {
        const where = [
            { isPublic: true, isApproved: true } as Partial<T>,
            { createdById: userId } as Partial<T>,
        ] as FindManyOptions<T>['where'];

        return this.findActive({
            where,
        });
    }

    async findAllAvailablePaginated(
        userId: number,
        isAdmin: boolean,
        offset: number = 0,
        limit: number = 20,
    ): Promise<T[]> {
        let where = [
            { isPublic: true, isApproved: true } as Partial<T>,
            { createdById: userId } as Partial<T>,
        ] as FindManyOptions<T>['where'];

        if (isAdmin) {
            where = undefined;
        }

        return this.findActivePaginated(offset, limit, {
            where,
        });
    }

    async findAllPublicAndApproved(): Promise<T[]> {
        return this.findActive({
            where: {
                isPublic: true,
                isApproved: true,
            } as FindManyOptions<T>['where'],
        });
    }

    async findAllAvailableIncludingDeleted(
        userId: number,
        isAdmin: boolean,
    ): Promise<T[]> {
        let where = [
            { isPublic: true, isApproved: true } as Partial<T>,
            { createdById: userId } as Partial<T>,
        ] as FindManyOptions<T>['where'];

        if (isAdmin) {
            // Admin can see all entities (including deleted ones)
            where = undefined; // No filtering except what's handled by find() method
        }

        return this.find({
            where,
        });
    }

    async findAllDeletedAvailable(
        userId: number,
        isAdmin: boolean,
    ): Promise<T[]> {
        let where = [
            {
                isPublic: true,
                isApproved: true,
                isDeleted: true,
            } as Partial<T>,
            { createdById: userId, isDeleted: true } as Partial<T>,
        ] as FindManyOptions<T>['where'];

        if (isAdmin) {
            // Admin can see all deleted entities
            where = { isDeleted: true } as FindManyOptions<T>['where'];
        }

        return this.find({
            where,
        });
    }

    async findAllWaitingForApproval(): Promise<T[]> {
        return this.findActive({
            where: {
                isPublic: true,
                isApproved: false,
            } as FindManyOptions<T>['where'],
        });
    }
}
