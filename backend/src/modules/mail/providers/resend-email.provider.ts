import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import {
    IEmailProvider,
    EmailData,
    EmailResult,
} from '../interfaces/email-provider.interface';

/**
 * Resend email provider implementation
 * Uses Resend service for sending transactional emails in production
 */
@Injectable()
export class ResendEmailProvider implements IEmailProvider {
    private readonly logger = new Logger(ResendEmailProvider.name);
    private readonly resend: Resend;

    constructor(private readonly configService: ConfigService) {
        const apiKey = this.configService.get<string>('RESEND_API_KEY');
        if (!apiKey) {
            throw new Error(
                'RESEND_API_KEY is not defined in environment variables',
            );
        }

        this.resend = new Resend(apiKey);
        this.logger.log('Resend email provider initialized');
    }

    async sendEmail(emailData: EmailData): Promise<EmailResult> {
        this.logger.log(
            `Sending email via Resend to ${emailData.to.length} recipient(s)`,
        );

        try {
            const result = await this.resend.emails.send({
                from: emailData.from,
                to: emailData.to,
                subject: emailData.subject,
                html: emailData.html,
                text: emailData.text,
            });

            if (result.error) {
                this.logger.error(
                    `Resend API error: ${JSON.stringify(result.error)}`,
                );
                return {
                    id: '',
                    success: false,
                    error: result.error.message || 'Unknown Resend error',
                };
            }

            this.logger.log(`Email sent successfully (ID: ${result.data?.id})`);
            return {
                id: result.data?.id || '',
                success: true,
            };
        } catch (error) {
            this.logger.error(`Failed to send email via Resend: ${error}`);
            return {
                id: '',
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
}
