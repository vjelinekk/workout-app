import { ConfigService } from '@nestjs/config';
import { resolve } from 'path';

/**
 * Validates and gets the upload directory path.
 * Ensures the path is within the ./public directory to prevent path traversal.
 */
export function getValidatedUploadDir(configService: ConfigService): string {
    const configPath = configService.get<string>('IMAGE_UPLOAD_PATH');
    const basePath = configPath || './public/uploads/exercises';
    const uploadDir = resolve(basePath);

    if (!uploadDir.includes(resolve('./public'))) {
        throw new Error(
            'IMAGE_UPLOAD_PATH must be within the ./public directory',
        );
    }

    return uploadDir;
}
