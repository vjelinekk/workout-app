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
import { WorkoutSessionPlanExerciseService } from '../services/workout-session-plan-exercise.service';
import { WorkoutSessionPlanExerciseCreateDto } from '../dtos/workout-session-plan-exercise/workout-session-plan-exercise-create.dto';
import { WorkoutSessionPlanExerciseResponseDto } from '../dtos/workout-session-plan-exercise/workout-session-plan-exercise-response.dto';
import { WorkoutSessionPlanExercisePatchDto } from '../dtos/workout-session-plan-exercise/workout-session-plan-exercise-patch.dto';
import { WorkoutSessionPlanExerciseUpdateDto } from '../dtos/workout-session-plan-exercise/workout-session-plan-exercise-update.dto';
import { Roles } from 'src/modules/auth/decorators/role.decorator';
import { RoleEnum } from 'src/modules/user/enums/role.enum';
import { JwtUser } from 'src/modules/auth/decorators/jwt-user.decorator';
import type { JwtAuthenticatedUser } from 'src/modules/auth/types/jwt-authenticated-user.type';

@ApiTags('Workout Session Plan Exercises')
@Controller('workout-session-plan-exercises')
export class WorkoutSessionPlanExerciseController {
    constructor(
        private readonly workoutSessionPlanExerciseService: WorkoutSessionPlanExerciseService,
    ) {}

    @Post()
    @ApiOperation({ summary: 'Create a new workout session plan exercise' })
    @ApiBody({
        type: WorkoutSessionPlanExerciseCreateDto,
        description: 'Workout session plan exercise creation data',
    })
    @ApiOkResponse({
        description:
            'The workout session plan exercise has been successfully created.',
        type: WorkoutSessionPlanExerciseResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    @ApiBadRequestResponse({
        description: 'Invalid input data',
    })
    async create(
        @Body() createDto: WorkoutSessionPlanExerciseCreateDto,
        @JwtUser() user: JwtAuthenticatedUser,
    ): Promise<WorkoutSessionPlanExerciseResponseDto> {
        return this.workoutSessionPlanExerciseService.createMapped(
            createDto,
            user.id,
        );
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Patch a workout session plan exercise' })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'The ID of the workout session plan exercise',
    })
    @ApiOkResponse({
        description:
            'The workout session plan exercise has been successfully patched.',
        type: WorkoutSessionPlanExerciseResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    @ApiBadRequestResponse({
        description: 'Invalid input data',
    })
    @ApiForbiddenResponse({
        description: 'Cannot perform this patch',
    })
    async patch(
        @Param('id', ParseIntPipe) id: number,
        @Body() patchDto: WorkoutSessionPlanExercisePatchDto,
        @JwtUser() user: JwtAuthenticatedUser,
    ): Promise<WorkoutSessionPlanExerciseResponseDto> {
        return this.workoutSessionPlanExerciseService.patchMapped(
            id,
            patchDto,
            user.id,
        );
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a workout session plan exercise' })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'The ID of the workout session plan exercise',
    })
    @ApiOkResponse({
        description:
            'The workout session plan exercise has been successfully updated.',
        type: WorkoutSessionPlanExerciseResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    @ApiBadRequestResponse({
        description: 'Invalid input data',
    })
    @ApiForbiddenResponse({
        description: 'Cannot perform this update',
    })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDto: WorkoutSessionPlanExerciseUpdateDto,
        @JwtUser() user: JwtAuthenticatedUser,
    ): Promise<WorkoutSessionPlanExerciseResponseDto> {
        return this.workoutSessionPlanExerciseService.putMapped(
            id,
            updateDto,
            user.id,
        );
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a workout session plan exercise' })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'The ID of the workout session plan exercise',
    })
    @ApiOkResponse({
        description:
            'The workout session plan exercise has been successfully deleted.',
        type: WorkoutSessionPlanExerciseResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    async delete(
        @Param('id', ParseIntPipe) id: number,
        @JwtUser() user: JwtAuthenticatedUser,
    ): Promise<WorkoutSessionPlanExerciseResponseDto> {
        return await this.workoutSessionPlanExerciseService.deleteMapped(
            id,
            user.id,
        );
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get workout session plan exercise by ID' })
    @ApiOkResponse({
        description: 'The workout session plan exercise with the specified ID',
        type: WorkoutSessionPlanExerciseResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Workout session plan exercise not found',
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    @ApiBadRequestResponse({
        description: 'Invalid request',
    })
    async getById(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<WorkoutSessionPlanExerciseResponseDto> {
        return this.workoutSessionPlanExerciseService.findOneActiveMapped(id);
    }

    @Get()
    @ApiOperation({ summary: 'Get all workout session plan exercises' })
    @ApiOkResponse({
        description: 'List of all workout session plan exercises',
        type: [WorkoutSessionPlanExerciseResponseDto],
    })
    @ApiNotFoundResponse({
        description: 'No workout session plan exercises found',
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    @ApiBadRequestResponse({
        description: 'Invalid request',
    })
    @Roles(RoleEnum.ADMIN)
    async getAll(): Promise<WorkoutSessionPlanExerciseResponseDto[]> {
        return this.workoutSessionPlanExerciseService.findAllActiveMapped();
    }
}
