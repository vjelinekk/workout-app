# Mail Module

The mail module provides a flexible email sending system with support for multiple email providers through an adapter pattern.

## Architecture

The module uses the **Adapter Pattern** to decouple the mail service from specific email provider implementations. This makes it easy to:
- Swap email providers without changing business logic
- Use different providers for different environments (Resend for production, MailHog for development)
- Add new providers easily
- Test email functionality with mocks

## Providers

### Resend (Production)
- **Provider class**: `ResendEmailProvider`
- **Use case**: Production email delivery
- **Configuration**:
  - `RESEND_API_KEY` - Your Resend API key
  - `EMAIL_PROVIDER=resend` - Set this in .env
  - `RESEND_FROM` - Sender email address

### MailHog (Development)
- **Provider class**: `MailHogEmailProvider`
- **Use case**: Local development and testing
- **Configuration**:
  - `EMAIL_PROVIDER=mailhog` - Set this in .env
  - `MAILHOG_HOST=localhost` - MailHog SMTP host (default: localhost)
  - `MAILHOG_PORT=1025` - MailHog SMTP port (default: 1025)
  - `RESEND_FROM` - Sender email address
- **Web UI**: http://localhost:8025 to view sent emails

## Configuration

### Environment Variables

```env
# Email Provider Selection
EMAIL_PROVIDER=mailhog  # Options: 'resend' (default) or 'mailhog'

# Generic Email Configuration (required for all providers)
EMAIL_FROM=noreply@yourdomain.com  # Sender email address

# Development Email Override (optional)
EMAIL_DEV_TO=dev@example.com  # Override recipients in development

# Resend-specific Configuration (only needed when EMAIL_PROVIDER=resend)
RESEND_API_KEY=your_api_key_here

# MailHog-specific Configuration (only needed when EMAIL_PROVIDER=mailhog)
MAILHOG_HOST=localhost  # Optional, defaults to localhost
MAILHOG_PORT=1025       # Optional, defaults to 1025
```

### Quick Setup for Development

1. **Start MailHog** (if not already running):
   ```bash
   docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog
   ```

2. **Update your .env**:
   ```env
   EMAIL_PROVIDER=mailhog
   EMAIL_FROM=dev@localhost
   ```

3. **View emails**: Open http://localhost:8025 in your browser

## Usage in Code

The `MailService` provides high-level methods for sending specific types of emails:

```typescript
import { MailService } from './modules/mail/services/mail.service';

@Injectable()
export class SomeService {
  constructor(private readonly mailService: MailService) {}

  async sendTrainerRequest() {
    await this.mailService.becomeATrainer(
      ['admin@example.com'],
      'JohnDoe',
      'I would like to become a trainer...'
    );
  }
}
```

## Adding a New Email Provider

1. **Create provider class** implementing `IEmailProvider`:
   ```typescript
   // providers/sendgrid-email.provider.ts
   @Injectable()
   export class SendGridEmailProvider implements IEmailProvider {
     async sendEmail(emailData: EmailData): Promise<EmailResult> {
       // SendGrid implementation
     }
   }
   ```

2. **Register in module**:
   ```typescript
   // mail.module.ts
   @Module({
     providers: [
       SendGridEmailProvider,
       {
         provide: 'EMAIL_PROVIDER',
         useFactory: (config, sendgrid, resend, mailhog) => {
           const provider = config.get('EMAIL_PROVIDER');
           switch (provider) {
             case 'sendgrid': return sendgrid;
             case 'mailhog': return mailhog;
             default: return resend;
           }
         },
         inject: [ConfigService, SendGridEmailProvider, ResendEmailProvider, MailHogEmailProvider]
       }
     ]
   })
   ```

3. **Update environment variable**: `EMAIL_PROVIDER=sendgrid`

## Testing

For unit tests, inject a mock provider:

```typescript
const mockProvider: IEmailProvider = {
  sendEmail: jest.fn().mockResolvedValue({
    id: 'test-id',
    success: true
  })
};

const module = await Test.createTestingModule({
  providers: [
    MailService,
    { provide: 'EMAIL_PROVIDER', useValue: mockProvider },
    { provide: 'EMAIL_FROM', useValue: 'test@example.com' },
    ConfigService
  ]
}).compile();
```

## Interface

### IEmailProvider

```typescript
interface EmailData {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text?: string;
}

interface EmailResult {
  id: string;
  success: boolean;
  error?: string;
}

interface IEmailProvider {
  sendEmail(emailData: EmailData): Promise<EmailResult>;
}
```
