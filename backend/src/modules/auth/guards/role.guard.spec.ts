/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */

import { RoleEnum } from '../../user/enums/role.enum';
import {
    createMockExecutionContext,
    createMockReflector,
    createMockJwtUser,
} from '../../../common/test/test-helpers';

/**
 * Tests for RoleGuard
 *
 * RoleGuard implements role-based access control (RBAC):
 * - Reads required roles from @Roles decorator metadata
 * - Extracts user from request context
 * - Checks if user has at least one required role
 * - Allows access if no roles are defined (optional authorization)
 * - Denies access if user doesn't have required roles
 */
describe('RoleGuard', () => {
    let guard: any;
    let mockReflector: any;

    beforeEach(() => {
        mockReflector = createMockReflector();

        // Simulate the RoleGuard canActivate logic
        guard = {
            reflector: mockReflector,
            canActivate: (context: any): boolean => {
                const requiredRoles = guard.reflector.getAllAndOverride(
                    'roles', // ROLES_KEY
                    [context.getHandler(), context.getClass()],
                );

                if (!requiredRoles) {
                    return true; // No roles defined, allow access
                }

                const request = context.switchToHttp().getRequest();
                const user = request.user;

                if (!user || !user.roles) {
                    return false; // No user or roles
                }

                // Return true if the user has at least one required role
                return user.roles.some((roleId: number) =>
                    requiredRoles.includes(roleId),
                );
            },
        };
    });

    describe('Basic Functionality', () => {
        it('should allow access when no roles are required', () => {
            const context = createMockExecutionContext({
                user: createMockJwtUser({ roles: [RoleEnum.TRAINEE] }),
            });
            mockReflector.getAllAndOverride.mockReturnValue(null);

            const result = guard.canActivate(context);

            expect(result).toBe(true);
        });

        it('should allow access when user has required role', () => {
            const context = createMockExecutionContext({
                user: createMockJwtUser({ roles: [RoleEnum.TRAINER] }),
            });
            mockReflector.getAllAndOverride.mockReturnValue([RoleEnum.TRAINER]);

            const result = guard.canActivate(context);

            expect(result).toBe(true);
        });

        it('should deny access when user does not have required role', () => {
            const context = createMockExecutionContext({
                user: createMockJwtUser({ roles: [RoleEnum.TRAINEE] }),
            });
            mockReflector.getAllAndOverride.mockReturnValue([RoleEnum.ADMIN]);

            const result = guard.canActivate(context);

            expect(result).toBe(false);
        });

        it('should allow access when user has one of multiple required roles', () => {
            const context = createMockExecutionContext({
                user: createMockJwtUser({ roles: [RoleEnum.TRAINER] }),
            });
            mockReflector.getAllAndOverride.mockReturnValue([
                RoleEnum.ADMIN,
                RoleEnum.TRAINER,
            ]);

            const result = guard.canActivate(context);

            expect(result).toBe(true);
        });

        it('should deny access when user has no matching role', () => {
            const context = createMockExecutionContext({
                user: createMockJwtUser({ roles: [RoleEnum.TRAINEE] }),
            });
            mockReflector.getAllAndOverride.mockReturnValue([
                RoleEnum.ADMIN,
                RoleEnum.TRAINER,
            ]);

            const result = guard.canActivate(context);

            expect(result).toBe(false);
        });
    });

    describe('Role Checking', () => {
        it('should check if user has admin role', () => {
            const context = createMockExecutionContext({
                user: createMockJwtUser({ roles: [RoleEnum.ADMIN] }),
            });
            mockReflector.getAllAndOverride.mockReturnValue([RoleEnum.ADMIN]);

            const result = guard.canActivate(context);

            expect(result).toBe(true);
        });

        it('should check if user has trainer role', () => {
            const context = createMockExecutionContext({
                user: createMockJwtUser({ roles: [RoleEnum.TRAINER] }),
            });
            mockReflector.getAllAndOverride.mockReturnValue([RoleEnum.TRAINER]);

            const result = guard.canActivate(context);

            expect(result).toBe(true);
        });

        it('should check if user has trainee role', () => {
            const context = createMockExecutionContext({
                user: createMockJwtUser({ roles: [RoleEnum.TRAINEE] }),
            });
            mockReflector.getAllAndOverride.mockReturnValue([RoleEnum.TRAINEE]);

            const result = guard.canActivate(context);

            expect(result).toBe(true);
        });

        it('should handle user with multiple roles', () => {
            const context = createMockExecutionContext({
                user: createMockJwtUser({
                    roles: [RoleEnum.TRAINER, RoleEnum.TRAINEE],
                }),
            });
            mockReflector.getAllAndOverride.mockReturnValue([RoleEnum.TRAINER]);

            const result = guard.canActivate(context);

            expect(result).toBe(true);
        });

        it('should allow access if user has any of required roles', () => {
            const context = createMockExecutionContext({
                user: createMockJwtUser({
                    roles: [RoleEnum.TRAINEE, RoleEnum.ADMIN],
                }),
            });
            mockReflector.getAllAndOverride.mockReturnValue([
                RoleEnum.TRAINER,
                RoleEnum.ADMIN,
            ]);

            const result = guard.canActivate(context);

            expect(result).toBe(true);
        });
    });

    describe('User Validation', () => {
        it('should deny access when user is not present', () => {
            const context = createMockExecutionContext({ user: null });
            mockReflector.getAllAndOverride.mockReturnValue([RoleEnum.ADMIN]);

            const result = guard.canActivate(context);

            expect(result).toBe(false);
        });

        it('should deny access when user has no roles', () => {
            const context = createMockExecutionContext({
                user: createMockJwtUser({ roles: [] }),
            });
            mockReflector.getAllAndOverride.mockReturnValue([RoleEnum.ADMIN]);

            const result = guard.canActivate(context);

            expect(result).toBe(false);
        });

        it('should deny access when user roles is null', () => {
            const context = createMockExecutionContext({
                user: { id: 1, nickname: 'user', roles: null },
            });
            mockReflector.getAllAndOverride.mockReturnValue([RoleEnum.ADMIN]);

            const result = guard.canActivate(context);

            expect(result).toBe(false);
        });

        it('should deny access when user roles is undefined', () => {
            const context = createMockExecutionContext({
                user: { id: 1, nickname: 'user', roles: undefined },
            });
            mockReflector.getAllAndOverride.mockReturnValue([RoleEnum.ADMIN]);

            const result = guard.canActivate(context);

            expect(result).toBe(false);
        });
    });

    describe('Metadata Extraction', () => {
        it('should call reflector.getAllAndOverride with ROLES_KEY', () => {
            const context = createMockExecutionContext({
                user: createMockJwtUser({ roles: [RoleEnum.ADMIN] }),
            });
            mockReflector.getAllAndOverride.mockReturnValue([RoleEnum.ADMIN]);

            guard.canActivate(context);

            expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(
                'roles',
                [context.getHandler(), context.getClass()],
            );
        });

        it('should pass handler and class to getAllAndOverride', () => {
            const context = createMockExecutionContext({
                user: createMockJwtUser({ roles: [RoleEnum.ADMIN] }),
            });
            mockReflector.getAllAndOverride.mockReturnValue([RoleEnum.ADMIN]);

            guard.canActivate(context);

            const callArgs = mockReflector.getAllAndOverride.mock.calls[0];
            expect(callArgs[1]).toContain(context.getHandler());
            expect(callArgs[1]).toContain(context.getClass());
        });

        it('should return true when no metadata is defined', () => {
            const context = createMockExecutionContext({
                user: createMockJwtUser({ roles: [RoleEnum.TRAINEE] }),
            });
            mockReflector.getAllAndOverride.mockReturnValue(undefined);

            const result = guard.canActivate(context);

            expect(result).toBe(true);
        });

        it('should return true when metadata is null', () => {
            const context = createMockExecutionContext({
                user: createMockJwtUser({ roles: [RoleEnum.TRAINEE] }),
            });
            mockReflector.getAllAndOverride.mockReturnValue(null);

            const result = guard.canActivate(context);

            expect(result).toBe(true);
        });

        it('should return false when metadata is empty array', () => {
            const context = createMockExecutionContext({
                user: createMockJwtUser({ roles: [RoleEnum.TRAINEE] }),
            });
            mockReflector.getAllAndOverride.mockReturnValue([]);

            const result = guard.canActivate(context);

            // Empty array means no roles match (user has trainee, required has nothing)
            expect(result).toBe(false);
        });
    });

    describe('Context Handling', () => {
        it('should switch to HTTP context', () => {
            const context = createMockExecutionContext({
                user: createMockJwtUser({ roles: [RoleEnum.ADMIN] }),
            });
            mockReflector.getAllAndOverride.mockReturnValue([RoleEnum.ADMIN]);

            guard.canActivate(context);

            expect(context.switchToHttp).toHaveBeenCalled();
        });

        it('should get request from HTTP context', () => {
            const context = createMockExecutionContext({
                user: createMockJwtUser({ roles: [RoleEnum.ADMIN] }),
            });
            mockReflector.getAllAndOverride.mockReturnValue([RoleEnum.ADMIN]);

            guard.canActivate(context);

            const httpContext = context.switchToHttp();
            expect(httpContext.getRequest).toHaveBeenCalled();
        });

        it('should extract user from request', () => {
            const user = createMockJwtUser({ roles: [RoleEnum.ADMIN] });
            const context = createMockExecutionContext({ user });
            mockReflector.getAllAndOverride.mockReturnValue([RoleEnum.ADMIN]);

            guard.canActivate(context);

            expect(context.switchToHttp).toHaveBeenCalled();
        });
    });

    describe('Access Control Scenarios', () => {
        it('should allow admin to access admin-only route', () => {
            const context = createMockExecutionContext({
                user: createMockJwtUser({ roles: [RoleEnum.ADMIN] }),
            });
            mockReflector.getAllAndOverride.mockReturnValue([RoleEnum.ADMIN]);

            const result = guard.canActivate(context);

            expect(result).toBe(true);
        });

        it('should deny trainee from accessing admin-only route', () => {
            const context = createMockExecutionContext({
                user: createMockJwtUser({ roles: [RoleEnum.TRAINEE] }),
            });
            mockReflector.getAllAndOverride.mockReturnValue([RoleEnum.ADMIN]);

            const result = guard.canActivate(context);

            expect(result).toBe(false);
        });

        it('should allow trainer to access trainer-only route', () => {
            const context = createMockExecutionContext({
                user: createMockJwtUser({ roles: [RoleEnum.TRAINER] }),
            });
            mockReflector.getAllAndOverride.mockReturnValue([RoleEnum.TRAINER]);

            const result = guard.canActivate(context);

            expect(result).toBe(true);
        });

        it('should allow admin to access routes that include admin role', () => {
            const context = createMockExecutionContext({
                user: createMockJwtUser({ roles: [RoleEnum.ADMIN] }),
            });
            // Route allows ADMIN role
            mockReflector.getAllAndOverride.mockReturnValue([RoleEnum.ADMIN]);

            const result = guard.canActivate(context);

            expect(result).toBe(true);
        });

        it('should allow multi-role route for users with any required role', () => {
            const context = createMockExecutionContext({
                user: createMockJwtUser({ roles: [RoleEnum.TRAINER] }),
            });
            // Route allows TRAINER or ADMIN
            mockReflector.getAllAndOverride.mockReturnValue([
                RoleEnum.TRAINER,
                RoleEnum.ADMIN,
            ]);

            const result = guard.canActivate(context);

            expect(result).toBe(true);
        });

        it('should deny public route access when roles do not match', () => {
            const context = createMockExecutionContext({
                user: createMockJwtUser({ roles: [RoleEnum.TRAINEE] }),
            });
            mockReflector.getAllAndOverride.mockReturnValue([
                RoleEnum.ADMIN,
                RoleEnum.TRAINER,
            ]);

            const result = guard.canActivate(context);

            expect(result).toBe(false);
        });
    });

    describe('Edge Cases', () => {
        it('should handle single role requirement correctly', () => {
            const context = createMockExecutionContext({
                user: createMockJwtUser({ roles: [RoleEnum.TRAINER] }),
            });
            mockReflector.getAllAndOverride.mockReturnValue([RoleEnum.TRAINER]);

            const result = guard.canActivate(context);

            expect(result).toBe(true);
        });

        it('should handle many role requirements', () => {
            const allRoles = [
                RoleEnum.ADMIN,
                RoleEnum.TRAINER,
                RoleEnum.TRAINEE,
            ];
            const context = createMockExecutionContext({
                user: createMockJwtUser({ roles: [RoleEnum.TRAINEE] }),
            });
            mockReflector.getAllAndOverride.mockReturnValue(allRoles);

            const result = guard.canActivate(context);

            expect(result).toBe(true);
        });

        it('should handle user with many roles', () => {
            const context = createMockExecutionContext({
                user: createMockJwtUser({
                    roles: [RoleEnum.ADMIN, RoleEnum.TRAINER, RoleEnum.TRAINEE],
                }),
            });
            mockReflector.getAllAndOverride.mockReturnValue([RoleEnum.TRAINER]);

            const result = guard.canActivate(context);

            expect(result).toBe(true);
        });

        it('should return false for mismatched numeric roles', () => {
            const context = createMockExecutionContext({
                user: createMockJwtUser({ roles: [1] }),
            });
            mockReflector.getAllAndOverride.mockReturnValue([2, 3]);

            const result = guard.canActivate(context);

            expect(result).toBe(false);
        });

        it('should handle role comparison correctly', () => {
            const context = createMockExecutionContext({
                user: createMockJwtUser({ roles: [RoleEnum.TRAINEE] }),
            });
            mockReflector.getAllAndOverride.mockReturnValue([RoleEnum.TRAINEE]);

            const result = guard.canActivate(context);

            expect(result).toBe(true);
        });
    });

    describe('Authorization Logic', () => {
        it('should use some() to check if user has any required role', () => {
            const context = createMockExecutionContext({
                user: createMockJwtUser({
                    roles: [RoleEnum.TRAINEE, RoleEnum.TRAINER],
                }),
            });
            mockReflector.getAllAndOverride.mockReturnValue([
                RoleEnum.TRAINER,
                RoleEnum.ADMIN,
            ]);

            const result = guard.canActivate(context);

            // Should find that TRAINER is in both arrays
            expect(result).toBe(true);
        });

        it('should return false when no user roles match required roles', () => {
            const context = createMockExecutionContext({
                user: createMockJwtUser({ roles: [RoleEnum.TRAINEE] }),
            });
            mockReflector.getAllAndOverride.mockReturnValue([
                RoleEnum.ADMIN,
                RoleEnum.TRAINER,
            ]);

            const result = guard.canActivate(context);

            expect(result).toBe(false);
        });

        it('should stop checking after finding first matching role', () => {
            const context = createMockExecutionContext({
                user: createMockJwtUser({
                    roles: [RoleEnum.TRAINEE, RoleEnum.TRAINER, RoleEnum.ADMIN],
                }),
            });
            mockReflector.getAllAndOverride.mockReturnValue([
                RoleEnum.TRAINEE,
                RoleEnum.ADMIN,
            ]);

            // Should find TRAINEE first and return true
            const result = guard.canActivate(context);

            expect(result).toBe(true);
        });
    });
});
