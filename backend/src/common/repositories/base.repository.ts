import {
    FindManyOptions,
    FindOneOptions,
    FindOptionsRelations,
    FindOptionsWhere,
    ObjectLiteral,
    Repository,
    SelectQueryBuilder,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { BaseEntity } from '../entities/base.entity';

/**
 * BaseRepository provides convenience helpers for entities using a soft-delete
 * boolean flag `isDeleted` (see BaseEntity). All "Active" methods automatically
 * filter out entities where `isDeleted = true`.
 *
 * Usage:
 * - Extend this class per entity and pass the underlying TypeORM Repository
 *   to the super constructor.
 *
 * Example:
 *   @example
 *   ```ts
 *   @Injectable()
 *   export class UserRepository extends BaseRepository<User> {
 *     constructor(@InjectRepository(User) repo: Repository<User>) {
 *       super(repo);
 *     }
 *   }
 *   ```
 */
export abstract class BaseRepository<
    T extends BaseEntity & ObjectLiteral,
> extends Repository<T> {
    /**
     * Wraps a TypeORM Repository so the base Repository API remains available
     * while adding helpers that enforce `isDeleted = false`.
     *
     * @param baseRepo The underlying repository instance for entity T.
     */
    constructor(protected readonly baseRepo: Repository<T>) {
        // Bridge to TypeORM's Repository internals
        super(baseRepo.target, baseRepo.manager, baseRepo.queryRunner);
    }

    // ---------- Query helpers (auto isDeleted = false) ----------

    /**
     * Adds `isDeleted = false` to a where clause (or array of clauses) unless
     * the clause already specifies `isDeleted`.
     *
     * @param where A single where clause or an array of where clauses.
     * @returns The where clause(s) ensured to include `isDeleted = false`.
     */
    protected withActiveWhere(
        where?: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    ): FindOptionsWhere<T> | FindOptionsWhere<T>[] | undefined {
        if (!where) return { isDeleted: false } as FindOptionsWhere<T>;

        const hasIsDeleted = (obj: unknown): obj is { isDeleted: boolean } =>
            typeof obj === 'object' && obj !== null && 'isDeleted' in obj;

        if (Array.isArray(where)) {
            return where.map((w) =>
                hasIsDeleted(w)
                    ? w
                    : ({
                          ...(w as Record<string, unknown>),
                          isDeleted: false,
                      } as FindOptionsWhere<T>),
            );
        }

        return hasIsDeleted(where)
            ? where
            : ({
                  ...(where as Record<string, unknown>),
                  isDeleted: false,
              } as FindOptionsWhere<T>);
    }

    /**
     * Applies `withActiveWhere` to the `where` property of provided find
     * options, preserving the rest of the options intact.
     *
     * @param options TypeORM find options.
     * @returns The same options with `isDeleted = false` enforced.
     */
    protected withActiveOptions<
        O extends { where?: FindOptionsWhere<T> | FindOptionsWhere<T>[] },
    >(options?: O): O {
        const merged = { ...(options ?? {}) } as O;
        merged.where = this.withActiveWhere(options?.where);
        return merged;
    }

    /**
     * Creates a query builder filtered to active rows (`isDeleted = false`).
     *
     * @param alias SQL alias to use for the entity table.
     * @returns A SelectQueryBuilder with soft-delete filter applied.
     */
    buildActiveQuery(alias: string): SelectQueryBuilder<T> {
        return this.createQueryBuilder(alias).where(
            `${alias}.isDeleted = :isDeleted`,
            { isDeleted: false },
        );
    }

    // ---------- Common reads (active only) ----------

    /**
     * Finds many active (non-deleted) entities using TypeORM find options.
     *
     * @param options Optional TypeORM find options.
     * @returns Promise resolving to an array of active entities.
     */
    async findActive(options?: FindManyOptions<T>): Promise<T[]> {
        return this.find(this.withActiveOptions(options));
    }

    /**
     * Finds many active (non-deleted) entities with pagination support.
     *
     * @param offset Number of records to skip
     * @param limit Number of records to return
     * @param options Optional TypeORM find options (skip/take will be overridden)
     * @returns Promise resolving to an array of active entities
     */
    async findActivePaginated(
        offset: number = 0,
        limit: number = 20,
        options?: FindManyOptions<T>,
    ): Promise<T[]> {
        const opts = this.withActiveOptions(options);
        opts.skip = offset;
        opts.take = limit;
        return this.find(opts);
    }

    /**
     * Finds a single active (non-deleted) entity using TypeORM find options.
     *
     * @param options TypeORM find-one options.
     * @returns Promise resolving to the entity or null if not found.
     */
    async findOneActive(options: FindOneOptions<T>): Promise<T | null> {
        return this.findOne(this.withActiveOptions(options));
    }

    /**
     * Finds an active (non-deleted) entity by its numeric primary key.
     *
     * @param id Entity primary key.
     * @param relations Optional relations to load.
     * @returns Promise resolving to the entity or null if not found.
     */
    async findByIdActive(
        id: number,
        relations?: FindOptionsRelations<T>,
    ): Promise<T | null> {
        return this.findOneActive({
            where: { id } as unknown as FindOptionsWhere<T>,
            relations,
        });
    }

    /**
     * Checks if there exists at least one active (non-deleted) entity matching
     * the provided `where` clause(s).
     *
     * @param where Single or multiple where clauses to match.
     * @returns Promise resolving to true if any row matches; otherwise false.
     */
    async existsBy(
        where: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    ): Promise<boolean> {
        const found = await this.findOne({
            where: this.withActiveWhere(where),
        });
        return !!found;
    }

    // ---------- Mutations: soft delete / hard delete / restore ----------

    /**
     * Soft-deletes an entity by id by updating `isDeleted` to true.
     * Performs a partial update without loading the entity.
     *
     * @param id Entity primary key.
     */
    async softDeleteById(id: number): Promise<boolean> {
        const updateResult = await this.update(
            { id } as unknown as FindOptionsWhere<T>,
            { isDeleted: true } as unknown as QueryDeepPartialEntity<T>,
        );

        return (updateResult.affected ?? 0) > 0;
    }

    /**
     * Restores a previously soft-deleted entity by id by setting
     * `isDeleted` back to false. Performs a partial update without
     * loading the entity.
     *
     * @param id Entity primary key.
     */
    async restoreById(id: number): Promise<boolean> {
        const updateResult = await this.update(
            { id } as unknown as FindOptionsWhere<T>,
            { isDeleted: false } as unknown as QueryDeepPartialEntity<T>,
        );

        return (updateResult.affected ?? 0) > 0;
    }

    /**
     * Permanently deletes an entity by id from the database.
     *
     * @param id Entity primary key.
     */
    async hardDeleteById(id: number): Promise<boolean> {
        const deleteResult = await this.delete({
            id,
        } as unknown as FindOptionsWhere<T>);

        return (deleteResult.affected ?? 0) > 0;
    }
}
