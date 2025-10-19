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
    async findAllPrivate(userId: number, isAdmin: boolean): Promise<T[]> {
        let where = { createdById: userId } as FindManyOptions<T>['where'];
        if (isAdmin) {
            // Admin can see all private entities (from all users)
            where = undefined; // No filtering by createdById
        }

        return this.findActive({
            where,
        });
    }

    async findOnePrivate(
        userId: number,
        id: number,
        isAdmin: boolean,
        relations?: string[],
    ): Promise<T | null> {
        let where = { createdById: userId, id } as FindManyOptions<T>['where'];
        if (isAdmin) {
            // Admin can access any entity by ID (regardless of creator)
            where = { id } as FindManyOptions<T>['where'];
        }

        return this.findOneActive({
            where,
            relations,
        });
    }

    async findAllAvailable(userId: number, isAdmin: boolean): Promise<T[]> {
        let where = [
            { isPublic: true, isApproved: true } as Partial<T>,
            { createdById: userId } as Partial<T>,
        ] as FindManyOptions<T>['where'];

        if (isAdmin) {
            // To admin are all workout plans available (no additional filtering)
            where = undefined; // Let withActiveWhere handle isDeleted: false only
        }

        return this.findActive({
            where,
        });
    }

    async findOneAvailable(
        userId: number,
        id: number,
        isAdmin: boolean,
        relations?: string[],
    ): Promise<T | null> {
        let where = [
            { isPublic: true, isApproved: true, id } as Partial<T>,
            { createdById: userId, id } as Partial<T>,
        ] as FindManyOptions<T>['where'];

        if (isAdmin) {
            where = [{ id } as Partial<T>] as FindManyOptions<T>['where'];
        }

        return this.findOneActive({
            where,
            relations,
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

    async findOnePublicAndApproved(
        id: number,
        relations?: string[],
    ): Promise<T | null> {
        return this.findOneActive({
            where: {
                isPublic: true,
                isApproved: true,
                id,
            } as FindManyOptions<T>['where'],
            relations,
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

    async findOneAvailableIncludingDeleted(
        userId: number,
        id: number,
        isAdmin: boolean,
        relations?: string[],
    ): Promise<T | null> {
        let where = [
            { isPublic: true, isApproved: true, id } as Partial<T>,
            { createdById: userId, id } as Partial<T>,
        ] as FindManyOptions<T>['where'];

        if (isAdmin) {
            // To admin are all workout plans available
            where = [{ id } as Partial<T>] as FindManyOptions<T>['where'];
        }

        return this.findOne({
            where,
            relations,
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
            where = [
                {
                    isPublic: true,
                    isApproved: true,
                    isDeleted: true,
                } as Partial<T>,
            ] as FindManyOptions<T>['where'];
        }

        return this.find({
            where,
        });
    }

    async findOneDeletedAvailable(
        userId: number,
        id: number,
        isAdmin: boolean,
        relations?: string[],
    ): Promise<T | null> {
        let where = [
            {
                isPublic: true,
                isApproved: true,
                isDeleted: true,
                id,
            } as Partial<T>,
            { createdById: userId, isDeleted: true, id } as Partial<T>,
        ] as FindManyOptions<T>['where'];

        if (isAdmin) {
            where = [
                {
                    isDeleted: true,
                    id,
                } as Partial<T>,
            ] as FindManyOptions<T>['where'];
        }

        return this.findOne({
            where,
            relations,
        });
    }
}
