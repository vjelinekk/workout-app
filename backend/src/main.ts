import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // CORS configuration
    const corsOrigins = process.env.CORS_ORIGINS?.split(',') ?? [];

    app.enableCors({
        origin: corsOrigins,
        credentials: true,
    });

    // Validation
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true, // Automatically transform payloads to be objects typed according to their DTO classes
            whitelist: true, // Strip properties that do not have decorators
            forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are present
        }),
    );

    // Interceptors
    app.useGlobalInterceptors(new LoggingInterceptor());

    // Exception Filters
    app.useGlobalFilters(new AllExceptionsFilter());

    // Swagger
    const config = new DocumentBuilder()
        .setTitle('Gym Workout API')
        .setDescription('API for logging and managing workouts')
        .setVersion('1.0')
        .addBearerAuth() // if you use JWT authentication
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    await app.listen(process.env.PORT ?? 3001);
}

void bootstrap();
