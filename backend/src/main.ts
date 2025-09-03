import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const corsOrigins = process.env.CORS_ORIGINS?.split(",") ?? [];

    app.enableCors({
        origin: corsOrigins,
        credentials: true,
    });

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
