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
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ExerciseService } from '../services/exercise.service';
import { ExerciseCreateDto } from '../dtos/exercise/exercise-create.dto';
import { ExerciseResponseDto } from '../dtos/exercise/exercise-response.dto';
import { JwtUser } from 'src/modules/auth/decorators/jwt-user.decorator';
import type { JwtAuthenticatedUser } from 'src/modules/auth/types/jwt-authenticated-user.type';
import { ExercisePatchDto } from '../dtos/exercise/exercise-patch.dto';
import { ExerciseUpdateDto } from '../dtos/exercise/exercise-update.dto';

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
    ): Promise<ExerciseResponseDto> {
        return await this.exerciseService.updateExercise(
            exerciseId,
            patchExerciseDto,
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
        @Param('id') id: number,
        @Body() updateExerciseDto: ExerciseUpdateDto,
    ): Promise<ExerciseResponseDto> {
        return await this.exerciseService.updateExercise(id, updateExerciseDto);
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
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    async deleteExercise(@Param('id', ParseIntPipe) id: number) {
        await this.exerciseService.delete(id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get exercise by ID' })
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
    ): Promise<ExerciseResponseDto> {
        return await this.exerciseService.findOneMapped(id);
    }

    @Get()
    @ApiOperation({ summary: 'Get all exercises' })
    @ApiOkResponse({
        description: 'List of all exercises',
        type: [ExerciseResponseDto],
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    @ApiBadRequestResponse({
        description: 'Invalid request',
    })
    async getAllExercises(): Promise<ExerciseResponseDto[]> {
        return await this.exerciseService.findAllMapped();
    }
}
