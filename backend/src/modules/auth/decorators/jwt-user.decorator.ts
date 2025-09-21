import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtAuthenticatedUser } from '../types/jwt-authenticated-user.type';
import { AuthenticatedRequest } from '../types/authenticated-request.type';

/**
 * Custom decorator to extract the authenticated user from the request object.
 * This decorator can be used in controller methods to access the user information
 * after successful JWT authentication.
 */
export const JwtUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): JwtAuthenticatedUser => {
        const request: AuthenticatedRequest = ctx.switchToHttp().getRequest();
        return request.user;
    },
);
