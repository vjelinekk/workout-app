import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { LoginResponseDto } from '../dtos/login-response.dto';
import { JwtPayload } from '../types/jwt-payload.type';
import { UserRepository } from 'src/modules/user/repositories/user.repository';

@Injectable()
export class AuthService {
    constructor(
        private readonly userRepository: UserRepository,
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
            userFistName: user.firstName,
            userLastName: user.lastName,
            userNickname: user.nickname,
            userEmail: user.email,
            roles: user.roles.map((role) => role.id),
        };
    }
}
