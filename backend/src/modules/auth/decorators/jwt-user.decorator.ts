import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtAuthenticatedUser } from '../types/jwt-authenticated-user.type';

export const JwtUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): JwtAuthenticatedUser => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);
