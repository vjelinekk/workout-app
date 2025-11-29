import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { ENV_FRONTEND_URL } from '../../../common/constants/env-keys';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
    private readonly logger = new Logger(GoogleAuthGuard.name);

    constructor(private configService: ConfigService) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const response = context.switchToHttp().getResponse<Response>();

        // Check if this is a callback with an error parameter
        const error = request.query?.error as string | undefined;
        if (error) {
            const errorDescription =
                (request.query?.error_description as string | undefined) ||
                'Unknown';
            this.logger.warn(
                `Google OAuth error: ${error}, reason: ${errorDescription}`,
            );

            // Redirect to frontend with error parameter
            const frontendUrl =
                this.configService.get<string>(ENV_FRONTEND_URL);
            const redirectUrl = new URL('/auth/callback', frontendUrl);
            redirectUrl.searchParams.append('error', this.mapOAuthError(error));

            response.redirect(redirectUrl.toString());
            return false;
        }

        // Proceed with normal authentication flow
        return super.canActivate(context) as Promise<boolean>;
    }

    handleRequest<TUser = Express.User>(
        err: Error | null,
        user: TUser | false,
        info: unknown,
    ): TUser {
        // If there's an error or no user, log it
        if (err || !user) {
            this.logger.error('Google OAuth authentication failed', {
                error: err?.message || 'Unknown error',
                info,
            });
            throw err || new Error('Authentication failed');
        }
        return user;
    }

    private mapOAuthError(error: string): string {
        // Map OAuth error codes to user-friendly error types
        const errorMap: Record<string, string> = {
            access_denied: 'cancelled',
            consent_required: 'consent_required',
            invalid_request: 'invalid_request',
            server_error: 'server_error',
        };
        return errorMap[error] || 'unknown_error';
    }
}
