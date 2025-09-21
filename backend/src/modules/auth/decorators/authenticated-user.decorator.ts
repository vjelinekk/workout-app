import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserEntity } from 'src/modules/user/entities/user.entity';

/**
 * Custom decorator to extract the authenticated user from the request object.
 * Usage: @AuthenticatedUser() user: UserEntity
 */
export const AuthenticatedUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): UserEntity => {
        const req = ctx
            .switchToHttp()
            .getRequest<Request & { user: UserEntity }>();
        return req.user;
    },
);
