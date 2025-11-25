import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import {
    IEmailProvider,
    EmailData,
    EmailResult,
} from '../interfaces/email-provider.interface';

/**
 * MailHog email provider implementation for development
 * Uses nodemailer to send emails to MailHog SMTP server for testing
 */
@Injectable()
export class MailHogEmailProvider implements IEmailProvider {
    private readonly logger = new Logger(MailHogEmailProvider.name);
    private readonly transporter: nodemailer.Transporter;

    constructor(private readonly configService: ConfigService) {
        const host = this.configService.get<string>('MAILHOG_HOST') || 'localhost';
        const port = this.configService.get<number>('MAILHOG_PORT') || 1025;

        this.transporter = nodemailer.createTransport({
            host,
            port,
            ignoreTLS: true,
            secure: false,
        });

        this.logger.log(
            `MailHog email provider initialized (${host}:${port})`,
        );
    }

    async sendEmail(emailData: EmailData): Promise<EmailResult> {
        this.logger.log(
            `Sending email via MailHog to ${emailData.to.length} recipient(s)`,
        );
        this.logger.debug(`Email subject: ${emailData.subject}`);

        try {
            const info = await this.transporter.sendMail({
                from: emailData.from,
                to: emailData.to.join(', '),
                subject: emailData.subject,
                html: emailData.html,
                text: emailData.text,
            });

            this.logger.log(
                `Email sent to MailHog successfully (Message ID: ${info.messageId})`,
            );
            this.logger.log(
                `View email at: http://localhost:8025 (MailHog web UI)`,
            );

            return {
                id: info.messageId,
                success: true,
            };
        } catch (error) {
            this.logger.error(`Failed to send email via MailHog: ${error}`);
            return {
                id: '',
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
}
