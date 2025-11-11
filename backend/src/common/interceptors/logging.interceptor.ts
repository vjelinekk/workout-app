import {
    CallHandler,
    ExecutionContext,
    Injectable,
    Logger,
    NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name);

    intercept(
        context: ExecutionContext,
        next: CallHandler<any>,
    ): Observable<any> | Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest<Request>();
        const { method, url } = request;
        const now = Date.now();

        return next.handle().pipe(
            tap(() => {
                const elapsed = Date.now() - now;
                this.logger.log({ method, url, elapsed }, 'Request processed');
            }),
        );
    }
}
