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
import { WorkoutSessionPlanService } from '../services/workout-session-plan.service';
import { WorkoutSessionPlanCreateDto } from '../dtos/workout-session-plan/workout-session-plan-create.dto';
import { WorkoutSessionPlanResponseDto } from '../dtos/workout-session-plan/workout-session-plan-response.dto';
import { JwtUser } from 'src/modules/auth/decorators/jwt-user.decorator';
import type { JwtAuthenticatedUser } from 'src/modules/auth/types/jwt-authenticated-user.type';
import { WorkoutSessionPlanPatchDto } from '../dtos/workout-session-plan/workout-session-plan-patch.dto';
import { WorkoutSessionPlanUpdateDto } from '../dtos/workout-session-plan/workout-session-plan-update.dto';

@ApiTags('Workout Session Plans')
@Controller('workout-session-plans')
export class WorkoutSessionPlanController {
    constructor(
        private readonly workoutSessionPlanService: WorkoutSessionPlanService,
    ) {}

    @Post()
    @ApiOperation({ summary: 'Create a new workout session plan' })
    @ApiBody({
        type: WorkoutSessionPlanCreateDto,
        description: 'Workout session plan creation data',
    })
    @ApiOkResponse({
        description: 'The workout session plan has been successfully created.',
        type: WorkoutSessionPlanResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    @ApiBadRequestResponse({
        description: 'Invalid input data',
    })
    async createWorkoutSessionPlan(
        @Body() createWorkoutSessionPlanDto: WorkoutSessionPlanCreateDto,
        @JwtUser() user: JwtAuthenticatedUser,
    ): Promise<WorkoutSessionPlanResponseDto> {
        return await this.workoutSessionPlanService.createMapped(
            createWorkoutSessionPlanDto,
            user.userId,
        );
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Patch a workout session plan' })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'The ID of the workout session plan',
    })
    @ApiOkResponse({
        description: 'The workout session plan has been successfully patched.',
        type: WorkoutSessionPlanResponseDto,
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
    async patchWorkoutSessionPlan(
        @Param('id', ParseIntPipe) workoutSessionPlanId: number,
        @Body() patchWorkoutSessionPlanDto: WorkoutSessionPlanPatchDto,
    ): Promise<WorkoutSessionPlanResponseDto> {
        return await this.workoutSessionPlanService.updateMapped(
            workoutSessionPlanId,
            patchWorkoutSessionPlanDto,
        );
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a workout session plan' })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'The ID of the workout session plan',
    })
    @ApiOkResponse({
        description: 'The workout session plan has been successfully updated.',
        type: WorkoutSessionPlanResponseDto,
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
    async updateWorkoutSessionPlan(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateWorkoutSessionPlanDto: WorkoutSessionPlanUpdateDto,
    ): Promise<WorkoutSessionPlanResponseDto> {
        return await this.workoutSessionPlanService.updateMapped(
            id,
            updateWorkoutSessionPlanDto,
        );
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a workout session plan' })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'The ID of the workout session plan',
    })
    @ApiOkResponse({
        description: 'The workout session plan has been successfully deleted.',
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    async deleteWorkoutSessionPlan(@Param('id', ParseIntPipe) id: number) {
        await this.workoutSessionPlanService.delete(id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get workout session plan by ID' })
    @ApiOkResponse({
        description: 'The workout session plan with the specified ID',
        type: WorkoutSessionPlanResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Workout session plan not found',
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    @ApiBadRequestResponse({
        description: 'Invalid request',
    })
    async getWorkoutSessionPlanById(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<WorkoutSessionPlanResponseDto> {
        return await this.workoutSessionPlanService.findOneMapped(id);
    }

    @Get()
    @ApiOperation({ summary: 'Get all workout session plans' })
    @ApiOkResponse({
        description: 'List of all workout session plans',
        type: [WorkoutSessionPlanResponseDto],
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    @ApiBadRequestResponse({
        description: 'Invalid request',
    })
    async getAllWorkoutSessionPlans(): Promise<
        WorkoutSessionPlanResponseDto[]
    > {
        return await this.workoutSessionPlanService.findAllMapped();
    }
}
