import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Put,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { WorkoutSessionService } from '../services/workout-session.service';
import { WorkoutSessionCreateDto } from '../dtos/workout-session/workout-session-create.dto';
import { WorkoutSessionResponseDto } from '../dtos/workout-session/workout-session-response.dto';
import { WorkoutSessionPatchDto } from '../dtos/workout-session/workout-session-patch.dto';
import { WorkoutSessionUpdateDto } from '../dtos/workout-session/workout-session-update.dto';
import { JwtUser } from 'src/modules/auth/decorators/jwt-user.decorator';
import type { JwtAuthenticatedUser } from 'src/modules/auth/types/jwt-authenticated-user.type';

@ApiTags('Workout Sessions')
@Controller('workout-sessions')
export class WorkoutSessionController {
    constructor(
        private readonly workoutSessionService: WorkoutSessionService,
    ) {}

    @Post()
    @ApiOperation({ summary: 'Create a new workout session' })
    @ApiBody({
        type: WorkoutSessionCreateDto,
        description: 'Workout session creation data',
    })
    @ApiOkResponse({
        description: 'The workout session has been successfully created.',
        type: WorkoutSessionResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    @ApiBadRequestResponse({
        description: 'Invalid input data',
    })
    async create(
        @Body() createDto: WorkoutSessionCreateDto,
        @JwtUser() user: JwtAuthenticatedUser,
    ): Promise<WorkoutSessionResponseDto> {
        return await this.workoutSessionService.createValidated(
            createDto,
            user
        );
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Patch a workout session' })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'The ID of the workout session',
    })
    @ApiOkResponse({
        description: 'The workout session has been successfully patched.',
        type: WorkoutSessionResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Workout session not found',
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    @ApiBadRequestResponse({
        description: 'Invalid input data',
    })
    @ApiForbiddenResponse({
        description: 'Cannot preform this patch',
    })
    async patch(
        @Param('id', ParseIntPipe) id: number,
        @Body() patchDto: WorkoutSessionPatchDto,
        @JwtUser() user: JwtAuthenticatedUser,
    ): Promise<WorkoutSessionResponseDto> {
        return await this.workoutSessionService.patchValidated(
            id,
            patchDto,
            user,
        );
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a workout session' })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'The ID of the workout session',
    })
    @ApiOkResponse({
        description: 'The workout session has been successfully updated.',
        type: WorkoutSessionResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Workout session not found',
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    @ApiBadRequestResponse({
        description: 'Invalid input data',
    })
    @ApiForbiddenResponse({
        description: 'Cannot preform this update',
    })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDto: WorkoutSessionUpdateDto,
        @JwtUser() user: JwtAuthenticatedUser,
    ): Promise<WorkoutSessionResponseDto> {
        return await this.workoutSessionService.putValidated(
            id,
            updateDto,
            user,
        );
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a workout session' })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'The ID of the workout session',
    })
    @ApiOkResponse({
        description: 'The workout session has been successfully deleted.',
    })
    @ApiNotFoundResponse({
        description: 'Workout session not found',
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    async delete(
        @Param('id', ParseIntPipe) id: number,
        @JwtUser() user: JwtAuthenticatedUser,
    ): Promise<WorkoutSessionResponseDto> {
        return await this.workoutSessionService.deleteValidated(id, user);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get workout session by ID' })
    @ApiOkResponse({
        description: 'The workout session with the specified ID',
        type: WorkoutSessionResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Workout session not found',
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    @ApiBadRequestResponse({
        description: 'Invalid request',
    })
    async get(
        @Param('id', ParseIntPipe) id: number,
        @JwtUser() user: JwtAuthenticatedUser,
    ): Promise<WorkoutSessionResponseDto> {
        return await this.workoutSessionService.findByIdActiveValidated(
            id,
            user,
        );
    }

    @Get()
    @ApiOperation({ summary: 'Get all workout sessions' })
    @ApiOkResponse({
        description: 'List of all workout sessions',
        type: [WorkoutSessionResponseDto],
    })
    @ApiNotFoundResponse({
        description: 'No workout sessions found',
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    @ApiBadRequestResponse({
        description: 'Invalid request',
    })
    async getAll(
        @JwtUser() user: JwtAuthenticatedUser,
    ): Promise<WorkoutSessionResponseDto[]> {
        return await this.workoutSessionService.findAllActiveMapped();
    }

    @Post('/:id/restore')
    @ApiOperation({ summary: 'Restore a deleted workout session' })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'The ID of the workout session to restore',
    })
    @ApiOkResponse({
        description: 'The workout session has been successfully restored.',
        type: WorkoutSessionResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    @ApiNotFoundResponse({
        description: 'Workout session not found',
    })
    @ApiForbiddenResponse({
        description: 'Cannot perform this restoration',
    })
    async restore(
        @Param('id', ParseIntPipe) id: number,
        @JwtUser() user: JwtAuthenticatedUser,
    ): Promise<WorkoutSessionResponseDto> {
        return await this.workoutSessionService.restoreValidated(id, user);
    }
}