/**
 * Email data structure for sending emails
 */
export interface EmailData {
    from: string;
    to: string[];
    subject: string;
    html: string;
    text?: string;
}

/**
 * Result returned after sending an email
 */
export interface EmailResult {
    id: string;
    success: boolean;
    error?: string;
}

/**
 * Interface for email provider implementations
 * Allows swapping between different email services (Resend, SendGrid, MailHog, etc.)
 */
export interface IEmailProvider {
    /**
     * Send an email using the provider's implementation
     * @param emailData The email data to send
     * @returns Promise with email result containing ID and status
     */
    sendEmail(emailData: EmailData): Promise<EmailResult>;
}
