import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../types/jwt-payload.type';
import { JwtAuthenticatedUser } from '../types/jwt-authenticated-user.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private config: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.get<string>('JWT_SECRET') || 'default',
        });
    }

    validate(payload: JwtPayload): JwtAuthenticatedUser {
        return {
            userId: payload.sub,
            nickname: payload.nickname,
            roles: payload.roles,
        };
    }
}
