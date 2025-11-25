import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import escapeHtml from 'escape-html';
import type { IEmailProvider } from '../interfaces/email-provider.interface';
import { EMAIL_PROVIDER_TOKEN } from '../constants/injection-tokens';

/**
 * Mail service for sending transactional emails to users.
 * Uses abstracted email provider (Resend, MailHog, etc.) for flexible email delivery.
 * Supports email notifications for trainer applications and other events.
 */
@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private readonly fromEmail: string;
    private readonly isProduction: boolean;
    private readonly devToEmail: string;

    constructor(
        @Inject(EMAIL_PROVIDER_TOKEN)
        private readonly emailProvider: IEmailProvider,
        private readonly configService: ConfigService,
    ) {
        const fromEmail = this.configService.get<string>('EMAIL_FROM');
        if (!fromEmail) {
            throw new Error(
                'EMAIL_FROM is not defined in environment variables',
            );
        }
        this.fromEmail = fromEmail;

        const nodeEnv = this.configService.get<string>('NODE_ENV');
        this.isProduction = nodeEnv === 'production';

        const devEmail = this.configService.get<string>('EMAIL_DEV_TO');
        if (!devEmail && !this.isProduction) {
            this.logger.warn(
                'EMAIL_DEV_TO is not defined - will use actual recipients in development',
            );
        }

        this.devToEmail = devEmail || '';
    }

    /**
     * Send trainer application email to admins/superadmins
     * @param to Array of recipient email addresses (admins)
     * @param requestingUserNickname Nickname of user requesting trainer status
     * @param message Application message from the user
     */
    async becomeATrainer(
        to: string[],
        requestingUserNickname: string,
        message: string,
    ) {
        // In development, override recipients to dev email if configured
        const recipients =
            this.isProduction || !this.devToEmail ? to : [this.devToEmail];

        this.logger.log(
            `Sending trainer request email from ${requestingUserNickname} to ${recipients.length} recipient(s)`,
        );

        const result = await this.emailProvider.sendEmail({
            from: this.fromEmail,
            to: recipients,
            subject: `New Trainer Request from ${requestingUserNickname}`,
            html: `<p>${escapeHtml(message)}</p>`,
        });

        if (!result.success) {
            this.logger.error(
                `Failed to send trainer request email: ${result.error}`,
            );
            throw new Error(
                result.error || 'Failed to send trainer request email',
            );
        }

        this.logger.log(
            `Trainer request email sent successfully (ID: ${result.id})`,
        );
        return result;
    }
}
