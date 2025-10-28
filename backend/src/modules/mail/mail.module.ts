import { Module } from '@nestjs/common';
import { MailService } from './services/mail.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Module({
    imports: [ConfigModule],
    providers: [
        MailService,
        Resend,
        {
            provide: 'RESEND_FROM_EMAIL',
            useFactory: (configService: ConfigService) => {
                const email = configService.get<string>('RESEND_FROM');
                if (!email) {
                    throw new Error(
                        'RESEND_FROM is not defined in environment variables',
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
