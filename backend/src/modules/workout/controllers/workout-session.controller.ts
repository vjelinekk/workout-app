import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Put,
} from '@nestjs/common';
import { WorkoutSessionCreateDto } from '../dtos/workout-session/workout-session-create.dto';
import { JwtUser } from 'src/modules/auth/decorators/jwt-user.decorator';
import type { JwtAuthenticatedUser } from 'src/modules/auth/types/jwt-authenticated-user.type';
import { WorkoutSessionService } from '../services/workout-session.service';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { WorkoutSessionStartDto } from '../dtos/workout-session/workout-session-start.dto';
import { WorkoutSessionResponseDto } from '../dtos/workout-session/workout-session-response.dto';
import { WorkoutSessionLogProgressDto } from '../dtos/workout-session/workout-session-log-progess.dto';

@ApiTags('Workout Sessions')
@Controller('workout-sessions')
export class WorkoutSessionController {
    constructor(
        private readonly workoutSessionService: WorkoutSessionService,
    ) {}

    @Post()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Start a new workout session' })
    @ApiBody({
        type: WorkoutSessionCreateDto,
        description: 'Workout session creation data',
    })
    @ApiOkResponse({
        description: 'The workout session has been successfully started.',
        type: WorkoutSessionStartDto,
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    @ApiBadRequestResponse({
        description: 'Invalid input data',
    })
    async start(
        @Body() createDto: WorkoutSessionCreateDto,
        @JwtUser() user: JwtAuthenticatedUser,
    ): Promise<WorkoutSessionResponseDto> {
        return await this.workoutSessionService.startWorkoutSession(
            createDto,
            user.id,
        );
    }

    @Get('in-progress')
    @ApiBearerAuth()
    async getWorkoutSessionInProgress(
        @JwtUser() user: JwtAuthenticatedUser,
    ): Promise<WorkoutSessionResponseDto> {
        return await this.workoutSessionService.getWorkoutSessionInProgress(
            user.id,
        );
    }

    @Get(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get workout session by ID' })
    @ApiOkResponse({
        description: 'The workout session has been successfully retrieved.',
        type: WorkoutSessionResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    @ApiBadRequestResponse({
        description: 'Invalid workout session ID',
    })
    async get(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<WorkoutSessionResponseDto> {
        return await this.workoutSessionService.getWorkoutSessionById(id);
    }

    @Put(':id/finish')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Finish workout session' })
    @ApiBody({
        type: WorkoutSessionLogProgressDto,
        description: 'Workout session progress data',
    })
    @ApiOkResponse({
        description: 'The workout session has been successfully finished.',
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    @ApiBadRequestResponse({
        description: 'Invalid input data',
    })
    async finish(
        @Param('id', ParseIntPipe) id: number,
        @Body() finishDto: WorkoutSessionLogProgressDto,
        @JwtUser() user: JwtAuthenticatedUser,
    ) {
        await this.workoutSessionService.finishWorkoutSession(
            finishDto,
            id,
            user.id,
        );
    }

    @Put(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Log workout session progress' })
    @ApiBody({
        type: WorkoutSessionLogProgressDto,
        description: 'Workout session progress data',
    })
    @ApiOkResponse({
        description:
            'The workout session progress has been successfully logged.',
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    @ApiBadRequestResponse({
        description: 'Invalid input data',
    })
    async logProgress(
        @Body() logProgressDto: WorkoutSessionLogProgressDto,
        @Param('id', ParseIntPipe) id: number,
        @JwtUser() user: JwtAuthenticatedUser,
    ) {
        await this.workoutSessionService.logWorkoutSessionProgress(
            logProgressDto,
            id,
            user.id,
        );
    }

    @Patch('time/sync')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Sync workout session time' })
    @ApiOkResponse({
        description: 'The workout session time has been successfully synced.',
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    @ApiNotFoundResponse({
        description: 'No active workout session found to sync time',
    })
    async syncTime(@JwtUser() user: JwtAuthenticatedUser) {
        await this.workoutSessionService.syncWorkoutSessionTime(user.id);
    }
}
