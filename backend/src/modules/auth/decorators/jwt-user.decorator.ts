import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtAuthenticatedUser } from '../types/jwt-authenticated-user.type';
import { AuthenticatedRequest } from '../types/authenticated-request.type';

export const JwtUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): JwtAuthenticatedUser => {
        const request: AuthenticatedRequest = ctx.switchToHttp().getRequest();
        return request.user;
    },
);
