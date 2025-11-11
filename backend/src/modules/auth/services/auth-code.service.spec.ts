import { AuthCodeService } from './auth-code.service';
import {
    mockLoginResponse,
    mockTrainerLoginResponse,
} from '../../../common/test/mock-data';

describe('AuthCodeService', () => {
    let service: AuthCodeService;

    beforeEach(() => {
        service = new AuthCodeService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('generateAuthCode', () => {
        it('should generate a unique authentication code', () => {
            const code = service.generateAuthCode(mockLoginResponse);

            expect(code).toBeDefined();
            expect(typeof code).toBe('string');
            expect(code.length).toBe(64); // 32 bytes = 64 hex characters
        });

        it('should generate different codes for each call', () => {
            const code1 = service.generateAuthCode(mockLoginResponse);
            const code2 = service.generateAuthCode(mockLoginResponse);

            expect(code1).not.toBe(code2);
        });

        it('should store login response associated with code', () => {
            const code = service.generateAuthCode(mockLoginResponse);
            const result = service.exchangeAuthCode(code);

            expect(result).toEqual(mockLoginResponse);
        });

        it('should handle different login responses', () => {
            const code1 = service.generateAuthCode(mockLoginResponse);
            const code2 = service.generateAuthCode(mockTrainerLoginResponse);

            const result1 = service.exchangeAuthCode(code1);
            const result2 = service.exchangeAuthCode(code2);

            expect(result1).toEqual(mockLoginResponse);
            expect(result2).toEqual(mockTrainerLoginResponse);
        });
    });

    describe('exchangeAuthCode', () => {
        it('should return login response for valid code', () => {
            const code = service.generateAuthCode(mockLoginResponse);
            const result = service.exchangeAuthCode(code);

            expect(result).toEqual(mockLoginResponse);
        });

        it('should return null for non-existent code', () => {
            const result = service.exchangeAuthCode('non-existent-code');

            expect(result).toBeNull();
        });

        it('should delete code after successful exchange', () => {
            const code = service.generateAuthCode(mockLoginResponse);

            service.exchangeAuthCode(code);
            const secondAttempt = service.exchangeAuthCode(code);

            expect(secondAttempt).toBeNull();
        });

        it('should return null for expired code', () => {
            const code = service.generateAuthCode(mockLoginResponse);

            // Simulate code expiration by moving time forward
            jest.useFakeTimers();
            jest.advanceTimersByTime(6 * 60 * 1000); // 6 minutes (past 5 minute expiry)

            const result = service.exchangeAuthCode(code);

            expect(result).toBeNull();

            jest.useRealTimers();
        });

        it('should delete expired code during exchange attempt', () => {
            const code = service.generateAuthCode(mockLoginResponse);

            jest.useFakeTimers();
            jest.advanceTimersByTime(6 * 60 * 1000);

            service.exchangeAuthCode(code);

            // Try to exchange again to ensure it was deleted
            const secondAttempt = service.exchangeAuthCode(code);

            expect(secondAttempt).toBeNull();

            jest.useRealTimers();
        });
    });

    describe('cleanup of expired codes', () => {
        it('should remove expired codes during generateAuthCode', () => {
            const code1 = service.generateAuthCode(mockLoginResponse);

            jest.useFakeTimers();
            jest.advanceTimersByTime(6 * 60 * 1000);

            // Generate another code which should trigger cleanup
            const code2 = service.generateAuthCode(mockTrainerLoginResponse);

            // Verify expired code is gone
            const result = service.exchangeAuthCode(code1);
            expect(result).toBeNull();

            // Verify new code still works
            const result2 = service.exchangeAuthCode(code2);
            expect(result2).toEqual(mockTrainerLoginResponse);

            jest.useRealTimers();
        });

        it('should remove expired codes during exchangeAuthCode', () => {
            const code1 = service.generateAuthCode(mockLoginResponse);

            jest.useFakeTimers();
            jest.advanceTimersByTime(6 * 60 * 1000);

            // Attempt to exchange expired code which should trigger cleanup
            service.exchangeAuthCode(code1);

            // Try to exchange the expired code again
            const secondAttempt = service.exchangeAuthCode(code1);
            expect(secondAttempt).toBeNull();

            jest.useRealTimers();
        });
    });

    describe('multiple codes management', () => {
        it('should manage multiple codes independently', () => {
            const code1 = service.generateAuthCode(mockLoginResponse);
            const code2 = service.generateAuthCode(mockTrainerLoginResponse);

            const result1 = service.exchangeAuthCode(code1);
            const result2 = service.exchangeAuthCode(code2);

            expect(result1).toEqual(mockLoginResponse);
            expect(result2).toEqual(mockTrainerLoginResponse);
        });

        it('should not affect other codes when one expires', () => {
            jest.useFakeTimers();

            const code1 = service.generateAuthCode(mockLoginResponse);

            jest.advanceTimersByTime(3 * 60 * 1000); // 3 minutes

            const code2 = service.generateAuthCode(mockTrainerLoginResponse);

            jest.advanceTimersByTime(3 * 60 * 1000); // Advance another 3 minutes (6 total)

            // code1 should be expired (6 minutes old), code2 should still be valid (3 minutes old)
            const result1 = service.exchangeAuthCode(code1);
            const result2 = service.exchangeAuthCode(code2);

            expect(result1).toBeNull();
            expect(result2).toEqual(mockTrainerLoginResponse);

            jest.useRealTimers();
        });
    });

    describe('edge cases', () => {
        it('should handle empty login response data', () => {
            const emptyResponse = {
                accessToken: '',
                userId: 0,
                userFirstName: '',
                userLastName: '',
                userNickname: '',
                userEmail: '',
                roles: [],
            };

            const code = service.generateAuthCode(emptyResponse);
            const result = service.exchangeAuthCode(code);

            expect(result).toEqual(emptyResponse);
        });

        it('should handle large number of codes', () => {
            const codes: string[] = [];

            for (let i = 0; i < 100; i++) {
                const code = service.generateAuthCode(mockLoginResponse);
                codes.push(code);
            }

            // All codes should be retrievable
            codes.forEach((code) => {
                const result = service.exchangeAuthCode(code);
                expect(result).toEqual(mockLoginResponse);
            });
        });

        it('should preserve code order in FIFO manner', () => {
            const code1 = service.generateAuthCode(mockLoginResponse);
            const code2 = service.generateAuthCode(mockTrainerLoginResponse);

            const result1 = service.exchangeAuthCode(code1);
            const result2 = service.exchangeAuthCode(code2);

            expect(result1).toEqual(mockLoginResponse);
            expect(result2).toEqual(mockTrainerLoginResponse);
        });
    });
});
