import {
    Injectable,
    UnauthorizedException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { LoginResponseDto } from '../dtos/login-response.dto';
import { JwtPayload } from '../types/jwt-payload.type';
import { UserRepository } from 'src/modules/user/repositories/user.repository';
import { RegisterDto } from '../dtos/register.dto';
import { RoleRepository } from 'src/modules/user/repositories/role.repository';
import { hashPassword } from 'src/common/utils/hash';
import { PostgresErrorCodes } from 'src/common/enums/postgres-error-codes.enum';

/**
 * Authentication service for handling user login, registration, and credential validation.
 * Manages JWT token generation and user credential verification using bcrypt.
 * Provides core authentication functionality for the application.
 */
@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly userRepository: UserRepository,
        private readonly roleRepository: RoleRepository,
        private jwtService: JwtService,
    ) {}

    /**
     * Validates user credentials by email and password.
     * Verifies the password against the stored hashed password using bcrypt.
     *
     * @param email The user's email address
     * @param pass The user's plaintext password to verify
     * @returns The user entity if credentials are valid
     * @throws UnauthorizedException if email not found or password does not match
     */
    async validateUser(email: string, pass: string): Promise<UserEntity> {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            this.logger.warn(`Failed login attempt for email: ${email}`);
            throw new UnauthorizedException('Invalid credentials');
        }

        const isMatch = await compare(pass, user.password);
        if (!isMatch) {
            this.logger.warn(
                `Failed login attempt for user ID: ${user.id} (incorrect password)`,
            );
            throw new UnauthorizedException('Invalid credentials');
        }

        this.logger.log(`User ${user.id} successfully authenticated`);
        return user;
    }

    /**
     * Generates JWT login response with authentication token.
     * Creates a signed JWT token containing user ID, nickname, and roles.
     *
     * @param user The authenticated user entity with loaded roles
     * @returns Login response containing access token and user profile information
     */
    login(user: UserEntity): LoginResponseDto {
        const roles = user.roles.map((role) => role.id);

        const payload: JwtPayload = {
            nickname: user.nickname,
            sub: user.id,
            roles,
        };

        this.logger.log(
            `User ${user.id} (${user.nickname}) logged in with roles: ${roles.join(', ')}`,
        );

        return {
            accessToken: this.jwtService.sign(payload),
            userId: user.id,
            userFirstName: user.firstName,
            userLastName: user.lastName,
            userNickname: user.nickname,
            userEmail: user.email,
            roles: user.roles.map((role) => role.id),
        };
    }

    /**
     * Registers a new user with email and password authentication.
     * Hashes the password using bcrypt and assigns the default user role.
     * Returns a login response with JWT token for immediate authentication.
     *
     * @param registerDto Registration data containing email, password, firstName, lastName, and nickname
     * @returns Login response with access token and user profile information
     * @throws UnauthorizedException if the default role does not exist in the system
     * @throws BadRequestException if email or nickname already exists
     */
    async register(registerDto: RegisterDto) {
        const password = registerDto.password;
        const hashedPassword = hashPassword(password);

        const defaultRole = await this.roleRepository.getDefaultRole();
        if (!defaultRole) {
            throw new UnauthorizedException('Default role not found');
        }

        const user = this.userRepository.create({
            email: registerDto.email,
            firstName: registerDto.firstName,
            lastName: registerDto.lastName,
            nickname: registerDto.nickname,
            password: hashedPassword,
            roles: [defaultRole],
        });

        try {
            const savedUser = await this.userRepository.save(user);
            this.logger.log(
                `New user registered: ${savedUser.id} (${savedUser.email})`,
            );
            return this.login(savedUser);
        } catch (error: unknown) {
            // Handle duplicate key violations (PostgreSQL unique constraint error)
            if (
                this.isDatabaseError(error) &&
                error.code === PostgresErrorCodes.UNIQUE_VIOLATION
            ) {
                const detail = error.detail || '';
                if (detail.includes('email')) {
                    this.logger.warn(
                        `Registration failed: Email already exists - ${registerDto.email}`,
                    );
                    throw new BadRequestException('Email already exists');
                }
                if (detail.includes('nickname')) {
                    this.logger.warn(
                        `Registration failed: Nickname already exists - ${registerDto.nickname}`,
                    );
                    throw new BadRequestException('Nickname already exists');
                }
                this.logger.warn(
                    `Registration failed: User already exists - ${registerDto.email}`,
                );
                throw new BadRequestException('User already exists');
            }
            this.logger.error(
                `Registration failed for ${registerDto.email}: ${error}`,
            );
            throw error;
        }
    }

    /**
     * Type guard to check if error is a database error with code and detail properties
     */
    private isDatabaseError(
        error: unknown,
    ): error is { code: string; detail?: string } {
        return (
            typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            typeof (error as { code: unknown }).code === 'string'
        );
    }
}
