/**
 * Environment variable keys used across the application.
 * Using constants prevents typos and provides IDE autocomplete.
 *
 * Naming Convention:
 * - Prefix: ENV_ to clearly indicate these are environment variable keys
 * - Format: ENV_<ACTUAL_KEY_NAME> (mirrors the .env variable name)
 * - Example: EMAIL_FROM → ENV_EMAIL_FROM
 */

// ==================== Database Configuration ====================
export const ENV_POSTGRES_HOST = 'POSTGRES_HOST';
export const ENV_POSTGRES_PORT = 'POSTGRES_PORT';
export const ENV_POSTGRES_USER = 'POSTGRES_USER';
export const ENV_POSTGRES_PASSWORD = 'POSTGRES_PASSWORD';
export const ENV_POSTGRES_DB = 'POSTGRES_DB';

// ==================== Application Configuration ====================
export const ENV_NODE_ENV = 'NODE_ENV';
export const ENV_PORT = 'PORT';
export const ENV_FRONTEND_URL = 'FRONTEND_URL';
export const ENV_CORS_ORIGINS = 'CORS_ORIGINS';

// ==================== Authentication Configuration ====================
export const ENV_JWT_SECRET = 'JWT_SECRET';
export const ENV_JWT_EXPIRES_IN = 'JWT_EXPIRES_IN';
export const ENV_GOOGLE_CLIENT_ID = 'GOOGLE_CLIENT_ID';
export const ENV_GOOGLE_CLIENT_SECRET = 'GOOGLE_CLIENT_SECRET';
export const ENV_GOOGLE_CALLBACK_URL = 'GOOGLE_CALLBACK_URL';
export const ENV_SUPERADMIN_PASSWORD = 'SUPERADMIN_PASSWORD';

// ==================== Email Configuration ====================
export const ENV_EMAIL_PROVIDER = 'EMAIL_PROVIDER';
export const ENV_EMAIL_FROM = 'EMAIL_FROM';
export const ENV_EMAIL_DEV_TO = 'EMAIL_DEV_TO';

// Resend-specific
export const ENV_RESEND_API_KEY = 'RESEND_API_KEY';

// MailHog-specific
export const ENV_MAILHOG_HOST = 'MAILHOG_HOST';
export const ENV_MAILHOG_PORT = 'MAILHOG_PORT';

// ==================== Redis Configuration ====================
export const ENV_REDIS_HOST = 'REDIS_HOST';
export const ENV_REDIS_PORT = 'REDIS_PORT';

// ==================== File Upload Configuration ====================
export const ENV_IMAGE_UPLOAD_PATH = 'IMAGE_UPLOAD_PATH';
