import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../types/jwt-payload.type';
import { JwtAuthenticatedUser } from '../types/jwt-authenticated-user.type';
import { UserRepository } from 'src/modules/user/repositories/user.repository';
import { ENV_JWT_SECRET } from '../../../common/constants/env-keys';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        config: ConfigService,
        private userRepository: UserRepository,
    ) {
        const secret = config.get<string>(ENV_JWT_SECRET);
        if (!secret) {
            throw new Error('JWT_SECRET must be configured');
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    async validate(payload: JwtPayload): Promise<JwtAuthenticatedUser> {
        // First verify the user still exists and is active
        const user = await this.userRepository.findByIdActive(payload.sub, {
            roles: true,
        });

        if (!user) {
            throw new UnauthorizedException('User not found or inactive');
        }

        // Check if user's roles have changed since token was issued
        const currentRoleIds = user.roles.map((role) => role.id);

        return {
            id: payload.sub,
            nickname: payload.nickname,
            roles: currentRoleIds,
        };
    }
}
