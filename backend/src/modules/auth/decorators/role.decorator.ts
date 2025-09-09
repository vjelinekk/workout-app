import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify roles allowed to access a route.
 * Example: @Roles(1, 2)
 */
export const Roles = (...roles: number[]) => SetMetadata(ROLES_KEY, roles);
