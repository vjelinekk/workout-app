/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/require-await, @typescript-eslint/no-unsafe-call */

import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { DataSource, EntityManager } from 'typeorm';
import { RoleEnum } from '../../modules/user/enums/role.enum';

/**
 * Creates a mock JwtService for testing
 */
export const createMockJwtService = (): jest.Mocked<JwtService> =>
    ({
        sign: jest.fn(),
        signAsync: jest.fn(),
        verify: jest.fn(),
        verifyAsync: jest.fn(),
        decode: jest.fn(),
    }) as any;

/**
 * Creates a mock ConfigService for testing
 */
export const createMockConfigService = (
    config: Record<string, any> = {},
): jest.Mocked<ConfigService> => {
    const defaultConfig: Record<string, any> = {
        JWT_SECRET: 'test-secret-key',
        JWT_EXPIRES_IN: '60m',
        GOOGLE_CLIENT_ID: 'test-google-client-id',
        GOOGLE_CLIENT_SECRET: 'test-google-client-secret',
        GOOGLE_CALLBACK_URL: 'http://localhost:3001/v1/auth/google/callback',
        ...config,
    };

    return {
        get: jest.fn((key: string) => defaultConfig[key]),
        getOrThrow: jest.fn((key: string) => {
            const value = defaultConfig[key];
            if (value === undefined) {
                throw new Error(`Configuration key ${key} not found`);
            }
            return value;
        }),
    } as any;
};

/**
 * Creates a mock TypeORM DataSource for testing
 */
export const createMockDataSource = (): jest.Mocked<DataSource> =>
    ({
        transaction: jest.fn(async (callback) => {
            return callback(createMockEntityManager());
        }),
        getRepository: jest.fn(),
        createQueryBuilder: jest.fn(),
    }) as any;

/**
 * Creates a mock TypeORM EntityManager for testing
 */
export const createMockEntityManager = (): jest.Mocked<EntityManager> =>
    ({
        save: jest.fn(),
        create: jest.fn(),
        findOne: jest.fn(),
        find: jest.fn(),
        createQueryBuilder: jest.fn(),
    }) as any;

/**
 * Creates a generic mock repository for testing
 */
export const createMockRepository = (
    overrides: Record<string, jest.Mock> = {},
) => ({
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    findOneActive: jest.fn(),
    findByIds: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    insert: jest.fn(),
    createQueryBuilder: jest.fn(),
    findByIdActive: jest.fn(),
    findActive: jest.fn(),
    findAllActive: jest.fn(),
    findAllAvailable: jest.fn(),
    findAllPrivate: jest.fn(),
    findAllPublicAndApproved: jest.fn(),
    remove: jest.fn(),
    // User repository specific methods
    findByEmail: jest.fn(),
    findByGoogleId: jest.fn(),
    // Role repository specific methods
    getDefaultRole: jest.fn(),
    // Trainer-trainee specific methods
    findByTrainerAndTrainee: jest.fn(),
    findActiveByTrainee: jest.fn(),
    findExistingRequest: jest.fn(),
    // Generic methods
    query: jest.fn(),
    ...overrides,
});

/**
 * Creates a mock Reflector for testing guards
 */
export const createMockReflector = (): jest.Mocked<Reflector> =>
    ({
        get: jest.fn(),
        getAllAndMerge: jest.fn(),
        getAllAndOverride: jest.fn(),
        getMetadata: jest.fn(),
    }) as any;

/**
 * Creates a mock ExecutionContext for testing guards
 */
export const createMockExecutionContext = (
    request: Record<string, any> = {},
) => {
    const httpContext = {
        getRequest: jest.fn().mockReturnValue(request),
        getResponse: jest.fn(),
        getNext: jest.fn(),
    };

    return {
        switchToHttp: jest.fn().mockReturnValue(httpContext),
        switchToRpc: jest.fn(),
        switchToWs: jest.fn(),
        getHandler: jest.fn(),
        getClass: jest.fn(),
        getArgs: jest.fn(),
        getArgByIndex: jest.fn(),
    } as any;
};

/**
 * Creates a mock JWT user object for testing
 */
export const createMockJwtUser = (
    overrides: Partial<{
        id: number;
        nickname: string;
        email: string;
        firstName: string;
        lastName: string;
        roles: RoleEnum[];
    }> = {},
) => ({
    id: 1,
    nickname: 'testuser',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    roles: [RoleEnum.TRAINEE],
    ...overrides,
});

/**
 * Creates a mock authenticated request with JWT user
 */
export const createMockAuthenticatedRequest = (
    jwtUser?: ReturnType<typeof createMockJwtUser>,
) => ({
    user: jwtUser || createMockJwtUser(),
});

/**
 * Creates a mock Passport context for strategies
 */
export const createMockPassportDone = () => {
    return jest.fn();
};

/**
 * Helper to setup common test module providers
 */
export const createTestModuleProviders = (
    serviceClass: any,
    customProviders: any[] = [],
) => {
    return [
        serviceClass,
        {
            provide: 'JwtService',
            useValue: createMockJwtService(),
        },
        {
            provide: ConfigService,
            useValue: createMockConfigService(),
        },
        ...customProviders,
    ];
};
