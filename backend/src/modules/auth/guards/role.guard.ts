// src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/role.decorator';
import { JwtAuthenticatedUser } from '../types/jwt-authenticated-user.type';

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<number[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredRoles) {
            return true; // No roles defined, allow access
        }

        const request = context.switchToHttp().getRequest<{ user: JwtAuthenticatedUser }>();
        const user = request.user;

        if (!user || !user.roles) {
            return false; // No user or roles
        }

        // Return true if the user has at least one required role
        return user.roles.some((roleId) => requiredRoles.includes(roleId));
    }
}
