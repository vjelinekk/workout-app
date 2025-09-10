import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserEntity } from 'src/modules/user/entities/user.entity';

export const AuthenticatedUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): UserEntity => {
        const req = ctx
            .switchToHttp()
            .getRequest<Request & { user: UserEntity }>();
        return req.user;
    },
);
