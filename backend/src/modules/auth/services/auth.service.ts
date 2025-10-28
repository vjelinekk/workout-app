import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { LoginResponseDto } from '../dtos/login-response.dto';
import { JwtPayload } from '../types/jwt-payload.type';
import { UserRepository } from 'src/modules/user/repositories/user.repository';
import { RegisterDto } from '../dtos/register.dto';
import { RoleRepository } from 'src/modules/user/repositories/role.repository';
import { hashPassword } from 'src/common/utils/hash';

@Injectable()
export class AuthService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly roleRepository: RoleRepository,
        private jwtService: JwtService,
    ) {}

    async validateUser(email: string, pass: string): Promise<UserEntity> {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isMatch = await compare(pass, user.password);
        if (!isMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return user;
    }

    login(user: UserEntity): LoginResponseDto {
        const roles = user.roles.map((role) => role.id);

        const payload: JwtPayload = {
            nickname: user.nickname,
            sub: user.id,
            roles,
        };

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

        const savedUser = await this.userRepository.save(user);
        return this.login(savedUser);
    }
}
