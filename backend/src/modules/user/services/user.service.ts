import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';
import { CreateFromGoogle } from '../types/create-from-google.type';
import { UserRepository } from '../repositories/user.repository';
import { RoleRepository } from '../repositories/role.repository';
import { hashPassword } from 'src/common/utils/hash';
import { RoleEnum } from '../enums/role.enum';
import { FindOptionsWhere, In } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from '../dtos/user-response.dto';
import { JwtAuthenticatedUser } from 'src/modules/auth/types/jwt-authenticated-user.type';
import { TrainerTraineeStatusEnum } from '../enums/trainer-trainee-status.enum';

/**
 * User service for managing user operations and user-related business logic.
 * Handles user creation, retrieval, role management, and trainer application workflows.
 * Provides methods for user authentication, profile management, and trainer request handling.
 */
@Injectable()
export class UserService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly rolesRepository: RoleRepository,
    ) {}

    /**
     * Finds a user by email address.
     *
     * @param email The email address to search for
     * @returns The user entity with the specified email
     * @throws NotFoundException if no user with the given email exists
     */
    async findByEmail(email: string): Promise<UserEntity> {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new NotFoundException(`User with email ${email} not found`);
        }

        return user;
    }

    /**
     * Finds a user by their Google OAuth ID.
     *
     * @param id The Google OAuth ID to search for
     * @returns The user entity with the specified Google ID, or null if not found
     */
    async findByGoogleId(id: string): Promise<UserEntity | null> {
        const user = await this.userRepository.findByGoogleId(id);
        if (!user) {
            return null;
        }

        return user;
    }

    /**
     * Creates a new user from Google OAuth credentials.
     * Generates a random hashed password and assigns the default user role.
     * Derives nickname from email if available, otherwise uses timestamp-based identifier.
     *
     * @param googleId The unique Google OAuth ID
     * @param email The user's email address
     * @param firstName The user's first name
     * @param lastName The user's last name
     * @returns The newly created user entity with default role assigned
     * @throws NotFoundException if the default role does not exist in the system
     */
    async createFromGoogle({
        googleId,
        email,
        firstName,
        lastName,
    }: CreateFromGoogle): Promise<UserEntity> {
        const defaultRole = await this.rolesRepository.getDefaultRole();
        if (!defaultRole) {
            throw new NotFoundException('Default role not found');
        }

        const randomPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = hashPassword(randomPassword);

        const nickname = email ? email.split('@')[0] : `user${Date.now()}`;

        const user = this.userRepository.create({
            googleId,
            email,
            firstName,
            lastName,
            nickname,
            password: hashedPassword,
            roles: [defaultRole],
        });

        return this.userRepository.save(user);
    }

    /**
     * Finds an active user by ID and eagerly loads their associated roles.
     *
     * @param id The user ID to retrieve
     * @returns The user entity with all associated roles loaded
     * @throws NotFoundException if no active user with the given ID exists
     */
    async findByIdWithRoles(id: number): Promise<UserEntity> {
        const user = await this.userRepository.findByIdActive(id, {
            roles: true,
        });
        if (!user) {
            throw new NotFoundException(`User not found`);
        }

        return user;
    }

    /**
     * Finds a user by ID and validates they do not already have the trainer role.
     * Used as a precondition for user trainer application requests.
     *
     * @param id The user ID to retrieve
     * @returns The user entity with roles loaded
     * @throws NotFoundException if no active user with the given ID exists
     * @throws BadRequestException if the user already has the trainer role
     */
    async findByIdForBecomeTrainer(id: number): Promise<UserEntity> {
        const user = await this.findByIdWithRoles(id);
        const hasTrainerRole = user.roles.some(
            (role) => (role.id as RoleEnum) === RoleEnum.TRAINER,
        );
        if (hasTrainerRole) {
            throw new BadRequestException(`User is already a trainer`);
        }

        return user;
    }

    /**
     * Retrieves all active users with the admin role.
     *
     * @returns Array of all admin users
     */
    async findAllAdmins(): Promise<UserEntity[]> {
        return this.userRepository.findActive({
            where: {
                roles: {
                    id: RoleEnum.ADMIN,
                },
            },
        });
    }

    /**
     * Retrieves all email addresses of users with the admin role.
     * Useful for sending notifications to administrators.
     *
     * @returns Array of email addresses for all admin users
     */
    async findAllAdminsEmails(): Promise<string[]> {
        const admins = await this.findAllAdmins();
        return admins.map((admin) => admin.email);
    }

    /**
     * Submits a trainer application request for a user.
     * Sets the trainer request flag and stores the reason for the application.
     *
     * @param userId The ID of the user requesting to become a trainer
     * @param reason The reason or motivation for becoming a trainer
     * @returns The updated user entity
     * @throws NotFoundException if no active user with the given ID exists
     * @throws BadRequestException if the user already has the trainer role
     * @throws BadRequestException if the user has already submitted a trainer application
     */
    async requestBecomeTrainer(
        userId: number,
        reason: string,
    ): Promise<UserEntity> {
        const user = await this.findByIdForBecomeTrainer(userId);
        if (user.wantToBecomeTrainer) {
            throw new BadRequestException(
                'User has already requested to become a trainer',
            );
        }

        user.wantToBecomeTrainer = true;
        user.becomeTrainerReason = reason;
        await this.userRepository.save(user);
        return user;
    }

    /**
     * Retrieves users based on filtering criteria.
     * Supports filtering by trainer requests, roles, and recruitment status.
     * When filtering for unrecruitedOrPending trainees, excludes users already assigned to the requesting trainer.
     * Uses an optimized query builder with LEFT JOIN to avoid N+1 queries.
     *
     * @param user The authenticated user making the request
     * @param trainerRequests Optional - if true, returns only users requesting to become trainers
     * @param roles Optional - filters users by specific roles (typically TRAINEE)
     * @param notRecruitedOrPending Optional - if true with TRAINEE role, excludes trainees already assigned to the trainer
     * @returns Array of user response DTOs matching the filter criteria
     */
    async getAll(
        user: JwtAuthenticatedUser,
        trainerRequests?: boolean,
        roles?: RoleEnum[],
        notRecruitedOrPending?: boolean,
    ): Promise<UserResponseDto[]> {
        const isAdminOrTrainer =
            user.roles.includes(RoleEnum.ADMIN) ||
            user.roles.includes(RoleEnum.TRAINER);

        // Use query builder when we need to exclude trainees
        if (
            notRecruitedOrPending &&
            roles &&
            roles.includes(RoleEnum.TRAINEE) &&
            isAdminOrTrainer
        ) {
            const queryBuilder = this.userRepository
                .createQueryBuilder('user')
                .leftJoin('user.roles', 'role')
                .leftJoin(
                    'trainer_trainee',
                    'tt',
                    'tt.traineeId = user.id AND tt.trainerId = :trainerId AND tt.isDeleted = false AND tt.status IN (:...statuses)',
                    {
                        trainerId: user.id,
                        statuses: [
                            TrainerTraineeStatusEnum.ACTIVE,
                            TrainerTraineeStatusEnum.PENDING,
                        ],
                    },
                )
                .where('user.isDeleted = false')
                .andWhere('role.id IN (:...roleIds)', { roleIds: roles })
                .andWhere('tt.id IS NULL'); // Exclude users with existing relationships

            if (trainerRequests) {
                queryBuilder.andWhere('user.wantToBecomeTrainer = true');
            }

            const users = await queryBuilder
                .leftJoinAndSelect('user.roles', 'userRoles')
                .getMany();

            return users.map((u) => {
                const userDto = plainToInstance(UserResponseDto, u, {
                    excludeExtraneousValues: true,
                });
                userDto.roles = u.roles.map((role) => role.id as RoleEnum);
                return userDto;
            });
        }

        const where: FindOptionsWhere<UserEntity> = {};

        if (trainerRequests) {
            where.wantToBecomeTrainer = true;
        }

        if (roles && roles.length > 0) {
            where.roles = {
                id: In(roles),
            };
        }

        const users = await this.userRepository.findActive({
            where,
            relations: {
                roles: true,
            },
        });

        return users.map((u) => {
            const userDto = plainToInstance(UserResponseDto, u, {
                excludeExtraneousValues: true,
            });
            const roles = u.roles.map((role) => role.id as RoleEnum);
            userDto.roles = roles;
            return userDto;
        });
    }

    /**
     * Resolves a pending trainer application by approving or denying the request.
     * If approved, assigns the trainer role to the user. Either way, clears the trainer request flag.
     *
     * @param userId The ID of the user whose application is being resolved
     * @param approve True to approve and assign trainer role, false to deny the request
     * @throws NotFoundException if no active user with the given ID exists
     * @throws BadRequestException if the user already has the trainer role
     * @throws NotFoundException if the trainer role does not exist in the system (on approval)
     */
    async resolveTrainerApplication(userId: number, approve: boolean) {
        const user = await this.findByIdForBecomeTrainer(userId);
        const currentUserRoles = user.roles;

        if (approve) {
            const trainerRole = await this.rolesRepository.findByIdActive(
                RoleEnum.TRAINER,
            );
            if (!trainerRole) {
                throw new NotFoundException('Trainer role not found');
            }
            user.roles = [...currentUserRoles, trainerRole];
        }

        user.wantToBecomeTrainer = false;
        user.becomeTrainerReason = null;

        await this.userRepository.save(user);
    }

    /**
     * Retrieves the public profile of a user by ID.
     * Returns user information formatted as a response DTO with roles included.
     *
     * @param id The user ID to retrieve
     * @returns User profile as response DTO with excluded sensitive fields
     * @throws NotFoundException if no active user with the given ID exists
     */
    async findByIdProfile(id: number): Promise<UserResponseDto> {
        const user = await this.findByIdWithRoles(id);

        const userDto = plainToInstance(UserResponseDto, user, {
            excludeExtraneousValues: true,
        });
        const roles = user.roles.map((role) => role.id as RoleEnum);
        userDto.roles = roles;
        return userDto;
    }
}
