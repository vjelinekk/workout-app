import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { UserService } from 'src/modules/user/services/user.service';
import { LoginResponseDto } from '../dtos/login-response.dto';
import { JwtPayload } from '../types/jwt-payload.type';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private jwtService: JwtService,
    ) {}

    async validateUser(email: string, pass: string): Promise<UserEntity> {
        const user = await this.userService.findByEmail(email);
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
            access_token: this.jwtService.sign(payload),
            user_id: user.id,
        };
    }
}
