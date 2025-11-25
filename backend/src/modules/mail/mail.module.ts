import { Module } from '@nestjs/common';
import { MailService } from './services/mail.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { IEmailProvider } from './interfaces/email-provider.interface';
import { ResendEmailProvider } from './providers/resend-email.provider';
import { MailHogEmailProvider } from './providers/mailhog-email.provider';
import { EMAIL_PROVIDER_TOKEN } from './constants/injection-tokens';
import { ENV_EMAIL_PROVIDER } from '../../common/constants/env-keys';

@Module({
    imports: [ConfigModule],
    providers: [
        MailService,
        ResendEmailProvider,
        MailHogEmailProvider,
        {
            provide: EMAIL_PROVIDER_TOKEN,
            useFactory: (
                configService: ConfigService,
                resendProvider: ResendEmailProvider,
                mailhogProvider: MailHogEmailProvider,
            ): IEmailProvider => {
                const emailProvider =
                    configService.get<string>(ENV_EMAIL_PROVIDER) || 'resend';

                switch (emailProvider.toLowerCase()) {
                    case 'mailhog':
                        return mailhogProvider;
                    case 'resend':
                    default:
                        return resendProvider;
                }
            },
            inject: [ConfigService, ResendEmailProvider, MailHogEmailProvider],
        },
    ],
    controllers: [],
    exports: [MailService],
})
export class MailModule {}
