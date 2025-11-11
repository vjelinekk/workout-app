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

@Injectable()
export class UserService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly rolesRepository: RoleRepository,
    ) { }

    async findByEmail(email: string): Promise<UserEntity> {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new NotFoundException(`User with email ${email} not found`);
        }

        return user;
    }

    async findByGoogleId(id: string): Promise<UserEntity | null> {
        const user = await this.userRepository.findByGoogleId(id);
        if (!user) {
            return null;
        }

        return user;
    }

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

    async findByIdWithRoles(id: number): Promise<UserEntity> {
        const user = await this.userRepository.findByIdActive(id, {
            roles: true,
        });
        if (!user) {
            throw new NotFoundException(`User not found`);
        }

        return user;
    }

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

    async findAllAdmins(): Promise<UserEntity[]> {
        return this.userRepository.findActive({
            where: {
                roles: {
                    id: RoleEnum.ADMIN,
                },
            },
        });
    }

    async findAllAdminsEmails(): Promise<string[]> {
        const admins = await this.findAllAdmins();
        return admins.map((admin) => admin.email);
    }

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
                    }
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
