import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter<unknown> {
    constructor(private readonly logger: PinoLogger) {}

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;
        // Prefer a human-readable message when available
        let message: unknown;
        if (exception instanceof HttpException) {
            message = exception.getResponse();
        } else if (
            exception &&
            typeof exception === 'object' &&
            'message' in exception
        ) {
            message = exception.message ?? exception;
        } else {
            message = exception;
        }

        this.logger.error(
            {
                statusCode: status,
                method: request.method,
                url: request.url,
                message,
            },
            `HTTP ${status} Error on ${request.method} ${request.url}`,
        );

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            message,
        });
    }
}
