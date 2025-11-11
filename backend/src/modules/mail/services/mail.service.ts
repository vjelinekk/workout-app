import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

/**
 * Mail service for sending transactional emails to users.
 * Integrates with Resend email provider for reliable email delivery.
 * Supports email notifications for trainer applications and other events.
 */
@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private readonly fromEmail: string;
    private readonly isProduction: boolean;
    private readonly devToEmail: string;

    constructor(
        private readonly resend: Resend,
        private readonly configService: ConfigService,
        @Inject('RESEND_FROM_EMAIL')
        fromEmail: string,
    ) {
        const apiKey = this.configService.get<string>('RESEND_API_KEY');
        if (!apiKey) {
            throw new Error(
                'RESEND_API_KEY is not defined in environment variables',
            );
        }

        this.resend = new Resend(apiKey);
        this.fromEmail = fromEmail;

        const nodeEnv = this.configService.get<string>('NODE_ENV');
        if (!nodeEnv || nodeEnv === 'development') {
            this.isProduction = false;
        } else {
            this.isProduction = true;
        }

        const devEmail = this.configService.get<string>('RESEND_DEV_TO');
        if (!devEmail && !this.isProduction) {
            throw new Error(
                'DEV_TO_EMAIL is not defined in environment variables',
            );
        }

        this.devToEmail = devEmail || '';
    }

    async becomeATrainer(
        to: string[],
        requestingUserNickname: string,
        message: string,
    ) {
        const recipients = this.isProduction ? to : [this.devToEmail];

        this.logger.log(
            `Sending trainer request email from ${requestingUserNickname} to ${recipients.length} recipient(s)`,
        );

        try {
            const result = await this.resend.emails.send({
                from: this.fromEmail,
                to: recipients,
                subject: `New Trainer Request from ${requestingUserNickname}`,
                html: `<p>${message}</p>`,
            });

            this.logger.log(
                `Trainer request email sent successfully (ID: ${result.data?.id})`,
            );
            return result;
        } catch (error) {
            this.logger.error(
                `Failed to send trainer request email: ${error}`,
            );
            throw error;
        }
    }
}
