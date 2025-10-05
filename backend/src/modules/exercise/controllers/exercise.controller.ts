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
    Query,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ExerciseService } from '../services/exercise.service';
import { ExerciseCreateDto } from '../dtos/exercise/exercise-create.dto';
import { ExerciseResponseDto } from '../dtos/exercise/exercise-response.dto';
import { JwtUser } from 'src/modules/auth/decorators/jwt-user.decorator';
import type { JwtAuthenticatedUser } from 'src/modules/auth/types/jwt-authenticated-user.type';
import { ExercisePatchDto } from '../dtos/exercise/exercise-patch.dto';
import { ExerciseUpdateDto } from '../dtos/exercise/exercise-update.dto';
import { FindAllScopes } from 'src/common/enums/find-all-scopes.enum';

@Controller('exercises')
export class ExerciseController {
    constructor(private readonly exerciseService: ExerciseService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new exercise' })
    @ApiBody({ type: ExerciseCreateDto, description: 'Exercise creation data' })
    @ApiOkResponse({
        description: 'The exercise has been successfully created.',
        type: ExerciseResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    @ApiBadRequestResponse({
        description: 'Invalid input data',
    })
    async createExercise(
        @Body() createExerciseDto: ExerciseCreateDto,
        @JwtUser() user: JwtAuthenticatedUser,
    ): Promise<ExerciseResponseDto> {
        return await this.exerciseService.createMapped(
            createExerciseDto,
            user.id,
        );
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Patch an exercise' })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'The ID of the exercise',
    })
    @ApiOkResponse({
        description: 'The exercise has been successfully patched.',
        type: ExerciseResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Exercise not found',
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
    async patchExercise(
        @Param('id', ParseIntPipe) exerciseId: number,
        @Body() patchExerciseDto: ExercisePatchDto,
        @JwtUser() user: JwtAuthenticatedUser,
    ): Promise<ExerciseResponseDto> {
        return await this.exerciseService.patchValidated(
            exerciseId,
            patchExerciseDto,
            user,
        );
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update an exercise' })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'The ID of the exercise',
    })
    @ApiOkResponse({
        description: 'The exercise has been successfully updated.',
        type: ExerciseResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Exercise not found',
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
    async updateExercise(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateExerciseDto: ExerciseUpdateDto,
        @JwtUser() user: JwtAuthenticatedUser,
    ): Promise<ExerciseResponseDto> {
        return await this.exerciseService.putValidated(
            id,
            updateExerciseDto,
            user,
        );
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an exercise' })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'The ID of the exercise',
    })
    @ApiOkResponse({
        description: 'The exercise has been successfully deleted.',
    })
    @ApiNotFoundResponse({
        description: 'Exercise not found',
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    async deleteExercise(
        @Param('id', ParseIntPipe) id: number,
        @JwtUser() user: JwtAuthenticatedUser,
    ): Promise<ExerciseResponseDto> {
        return await this.exerciseService.deleteValidated(id, user);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get exercise by ID' })
    @ApiQuery({
        name: 'scope',
        description: 'Scope of workout session plans to retrieve',
        required: false,
        schema: {
            type: 'string',
            enum: Object.values(FindAllScopes),
            default: FindAllScopes.AVAILABLE,
        },
    })
    @ApiOkResponse({
        description: 'The exercise with the specified ID',
        type: ExerciseResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Exercise not found',
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    @ApiBadRequestResponse({
        description: 'Invalid request',
    })
    async getExerciseById(
        @Param('id', ParseIntPipe) id: number,
        @Query('scope') scope: FindAllScopes = FindAllScopes.AVAILABLE,
        @JwtUser() user: JwtAuthenticatedUser,
    ): Promise<ExerciseResponseDto> {
        return await this.exerciseService.findOneAvailableAuthorized(
            user.id,
            user.roles,
            scope,
            id,
        );
    }

    @Get()
    @ApiOperation({ summary: 'Get all exercises' })
    @ApiQuery({
        name: 'scope',
        description: 'Scope of workout session plans to retrieve',
        required: false,
        schema: {
            type: 'string',
            enum: Object.values(FindAllScopes),
            default: FindAllScopes.AVAILABLE,
        },
    })
    @ApiOkResponse({
        description: 'List of all exercises',
        type: [ExerciseResponseDto],
    })
    @ApiNotFoundResponse({
        description: 'No exercises found',
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    @ApiBadRequestResponse({
        description: 'Invalid request',
    })
    async getAllExercises(
        @JwtUser() user: JwtAuthenticatedUser,
        @Query('scope') scope: FindAllScopes = FindAllScopes.AVAILABLE,
    ): Promise<ExerciseResponseDto[]> {
        return await this.exerciseService.findAllAvailableAuthorized(
            user.id,
            user.roles,
            scope,
        );
    }

    @Post('/:id/restore')
    @ApiOperation({ summary: 'Restore a deleted exercise' })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'The ID of the exercise to restore',
    })
    @ApiOkResponse({
        description: 'The exercise has been successfully restored.',
        type: ExerciseResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    @ApiNotFoundResponse({
        description: 'Exercise not found',
    })
    @ApiForbiddenResponse({
        description: 'Cannot perform this restoration',
    })
    async restoreExercise(
        @Param('id', ParseIntPipe) id: number,
        @JwtUser() user: JwtAuthenticatedUser,
    ): Promise<ExerciseResponseDto> {
        return await this.exerciseService.restoreValidated(id, user);
    }
}
