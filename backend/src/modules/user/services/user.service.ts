import { Injectable, NotFoundException } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';
import { hashSync } from 'bcrypt';
import { CreateFromGoogle } from '../types/create-from-google.type';
import { UserRepository } from '../repositories/user.repository';
import { RoleRepository } from '../repositories/role.repository';

@Injectable()
export class UserService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly rolesRepository: RoleRepository,
    ) {}

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
        const hashedPassword = hashSync(randomPassword, 10);

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
}
