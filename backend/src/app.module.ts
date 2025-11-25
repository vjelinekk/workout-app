import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { ExerciseModule } from './modules/exercise/exercise.module';
import { WorkoutModule } from './modules/workout/workout.module';
import { TrainingSplitModule } from './modules/training-split/training-split.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { RedisModule } from './common/redis/redis.module';
import { LoggerModule } from 'nestjs-pino';
import {
    ENV_POSTGRES_HOST,
    ENV_POSTGRES_PORT,
    ENV_POSTGRES_USER,
    ENV_POSTGRES_PASSWORD,
    ENV_POSTGRES_DB,
} from './common/constants/env-keys';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true, // Makes the configuration globally available
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get<string>(ENV_POSTGRES_HOST),
                port: configService.get<number>(ENV_POSTGRES_PORT),
                username: configService.get<string>(ENV_POSTGRES_USER),
                password: configService.get<string>(ENV_POSTGRES_PASSWORD),
                database: configService.get<string>(ENV_POSTGRES_DB),
                autoLoadEntities: true, // Automatically load entities
                synchronize: false,
            }),
        }),
        LoggerModule.forRoot(),
        RedisModule,
        AuthModule,
        ExerciseModule,
        WorkoutModule,
        TrainingSplitModule,
        ServeStaticModule.forRoot({
            rootPath: join(process.cwd(), 'public'),
        }),
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
    ],
})
export class AppModule {}
