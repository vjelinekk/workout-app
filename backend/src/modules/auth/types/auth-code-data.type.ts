import { LoginResponseDto } from '../dtos/login-response.dto';

export interface AuthCodeData {
    loginResponse: LoginResponseDto;
    expiresAt: Date;
}
