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
import { ExerciseCategoryCreateDto } from '../dtos/exercise-category/exercise-category-create.dto';
import { ExerciseCategoryResponseDto } from '../dtos/exercise-category/exercise-category-response.dto';
import { ExerciseCategoryService } from '../services/exercise-category.service';
import { ExerciseCategoryPatchDto } from '../dtos/exercise-category/exercise-category-patch.dto';
import { ExerciseCategoryUpdateDto } from '../dtos/exercise-category/exercise-category-update.dto';

@ApiTags('Exercise Categories')
@Controller('exercise-categories')
export class ExerciseCategoryController {
    constructor(
        private readonly exerciseCategoryService: ExerciseCategoryService,
    ) {}

    @Post()
    @ApiOperation({ summary: 'Create a new exercise category' })
    @ApiBody({
        type: ExerciseCategoryCreateDto,
        description: 'Exercise category creation data',
    })
    @ApiOkResponse({
        description: 'The exercise category has been successfully created.',
        type: ExerciseCategoryResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    @ApiBadRequestResponse({
        description: 'Invalid input data',
    })
    async createExerciseCategory(
        @Body() createExerciseCategory: ExerciseCategoryCreateDto,
    ): Promise<ExerciseCategoryResponseDto> {
        return this.exerciseCategoryService.createMapped(
            createExerciseCategory,
        );
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Patch an exercise category' })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'The ID of the exercise category',
    })
    @ApiOkResponse({
        description: 'The exercise category has been successfully patched.',
        type: ExerciseCategoryResponseDto,
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
    async patchExerciseCategory(
        @Param('id', ParseIntPipe) exerciseCategoryId: number,
        @Body() patchExerciseCategoryDto: ExerciseCategoryPatchDto,
    ): Promise<ExerciseCategoryResponseDto> {
        return this.exerciseCategoryService.updateMapped(
            exerciseCategoryId,
            patchExerciseCategoryDto,
        );
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update an exercise category' })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'The ID of the exercise category',
    })
    @ApiOkResponse({
        description: 'The exercise category has been successfully updated.',
        type: ExerciseCategoryResponseDto,
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
    async updateExerciseCategory(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateExerciseCategoryDto: ExerciseCategoryUpdateDto,
    ): Promise<ExerciseCategoryResponseDto> {
        return this.exerciseCategoryService.updateMapped(
            id,
            updateExerciseCategoryDto,
        );
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an exercise category' })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'The ID of the exercise category',
    })
    @ApiOkResponse({
        description: 'The exercise category has been successfully deleted.',
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    async deleteExerciseCategory(@Param('id', ParseIntPipe) id: number) {
        await this.exerciseCategoryService.delete(id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get exercise category by ID' })
    @ApiOkResponse({
        description: 'The exercise category with the specified ID',
        type: ExerciseCategoryResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Exercise category not found',
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    @ApiBadRequestResponse({
        description: 'Invalid request',
    })
    async getExerciseCategoryById(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<ExerciseCategoryResponseDto> {
        return this.exerciseCategoryService.findOneMapped(id);
    }

    @Get()
    @ApiOperation({ summary: 'Get all exercise categories' })
    @ApiOkResponse({
        description: 'List of all exercise categories',
        type: [ExerciseCategoryResponseDto],
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    @ApiBadRequestResponse({
        description: 'Invalid request',
    })
    async getAllExerciseCategories(): Promise<ExerciseCategoryResponseDto[]> {
        return this.exerciseCategoryService.findAllMapped();
    }
}
