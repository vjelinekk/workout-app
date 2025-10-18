import { Injectable } from '@nestjs/common';
import { AuthCodeData } from '../types/auth-code-data.type';
import { LoginResponseDto } from '../dtos/login-response.dto';
import { randomBytes } from 'crypto';

const AUTH_CODE_EXPIRATION_MS = 5 * 60 * 1000; // 5 minutes

@Injectable()
export class AuthCodeService {
    private authCodes: Map<string, AuthCodeData> = new Map();

    private cleanupExpiredCodes() {
        const now = new Date();

        for (const [code, data] of this.authCodes.entries()) {
            if (data.expiresAt < now) {
                this.authCodes.delete(code);
            }
        }
    }

    /**
     * Generates a unique authentication code linked to the provided login response.
     *
     * @param loginResponse LoginResponseDto from AuthService
     * @returns Generated auth code as a string
     */
    generateAuthCode(loginResponse: LoginResponseDto): string {
        const authCode = randomBytes(32).toString('hex');

        this.authCodes.set(authCode, {
            loginResponse,
            expiresAt: new Date(Date.now() + AUTH_CODE_EXPIRATION_MS),
        });

        this.cleanupExpiredCodes();

        return authCode;
    }

    /**
     * Exchanges an authentication code for the associated login response.
     *
     * @param authCode Authentication code to be exchanged
     * @returns LoginResponseDto if valid, otherwise null
     */
    exchangeAuthCode(authCode: string): LoginResponseDto | null {
        const data = this.authCodes.get(authCode);

        if (!data) {
            return null;
        }

        if (data.expiresAt < new Date()) {
            this.authCodes.delete(authCode);
            return null;
        }

        this.authCodes.delete(authCode);
        return data.loginResponse;
    }
}
