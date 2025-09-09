import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/modules/user/services/user.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        private config: ConfigService,
        private readonly userService: UserService,
    ) {
        super({
            clientID: config.get<string>('GOOGLE_CLIENT_ID') || 'default',
            clientSecret:
                config.get<string>('GOOGLE_CLIENT_SECRET') || 'default',
            callbackURL:
                config.get<string>('GOOGLE_CALLBACK_URL') ||
                'http://localhost:3001/auth/google/callback',
            scope: ['email', 'profile'],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallback,
    ) {
        const { id, name, emails } = profile;

        let user = await this.userService.findByGoogleId(id);

        if (!user) {
            user = await this.userService.createFromGoogle({
                googleId: id,
                email: emails?.[0].value,
                firstName: name?.givenName,
                lastName: name?.familyName,
            });
        }

        done(null, user);
    }
}
