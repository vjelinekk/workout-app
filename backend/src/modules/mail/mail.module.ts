import { Module } from '@nestjs/common';
import { MailService } from './services/mail.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IEmailProvider } from './interfaces/email-provider.interface';
import { ResendEmailProvider } from './providers/resend-email.provider';
import { MailHogEmailProvider } from './providers/mailhog-email.provider';

@Module({
    imports: [ConfigModule],
    providers: [
        MailService,
        ResendEmailProvider,
        MailHogEmailProvider,
        {
            provide: 'EMAIL_PROVIDER',
            useFactory: (
                configService: ConfigService,
                resendProvider: ResendEmailProvider,
                mailhogProvider: MailHogEmailProvider,
            ): IEmailProvider => {
                const emailProvider =
                    configService.get<string>('EMAIL_PROVIDER') || 'resend';

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
        {
            provide: 'EMAIL_FROM',
            useFactory: (configService: ConfigService) => {
                const email = configService.get<string>('EMAIL_FROM');
                if (!email) {
                    throw new Error(
                        'EMAIL_FROM is not defined in environment variables',
                    );
                }
                return email;
            },
            inject: [ConfigService],
        },
    ],
    controllers: [],
    exports: [MailService],
})
export class MailModule {}
