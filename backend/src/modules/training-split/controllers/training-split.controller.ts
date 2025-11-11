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
    ApiBearerAuth,
    ApiBody,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { TrainingSplitService } from '../services/training-split.service';
import { TrainingSplitCreateDto } from '../dtos/training-split/trainin-split-create.dto';
import { TrainingSplitResponseDto } from '../dtos/training-split/training-split-response.dto';
import { TrainingSplitPatchDto } from '../dtos/training-split/training-split-patch.dto';
import { TrainingSplitUpdateDto } from '../dtos/training-split/training-split-update.dto';
import { JwtUser } from 'src/modules/auth/decorators/jwt-user.decorator';
import type { JwtAuthenticatedUser } from 'src/modules/auth/types/jwt-authenticated-user.type';
import { FindAllScopes } from 'src/common/enums/find-all-scopes.enum';

/**
 * Training split controller managing weekly workout schedules.
 * Handles CRUD operations for training splits that define workout routines across different days.
 */
@ApiTags('Training Splits')
@Controller('training-splits')
export class TrainingSplitController {
    constructor(private readonly trainingSplitService: TrainingSplitService) {}

    @Post()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new training split' })
    @ApiBody({
        type: TrainingSplitCreateDto,
        description: 'Training split creation data',
    })
    @ApiOkResponse({
        description: 'The training split has been successfully created.',
        type: TrainingSplitResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    @ApiBadRequestResponse({
        description: 'Invalid input data',
    })
    async create(
        @Body() createDto: TrainingSplitCreateDto,
        @JwtUser() user: JwtAuthenticatedUser,
    ): Promise<TrainingSplitResponseDto> {
        return await this.trainingSplitService.createMapped(createDto, user.id);
    }

    @Patch(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Patch a training split' })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'The ID of the training split',
    })
    @ApiOkResponse({
        description: 'The training split has been successfully patched.',
        type: TrainingSplitResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Training split not found',
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
        @Body() patchDto: TrainingSplitPatchDto,
        @JwtUser() user: JwtAuthenticatedUser,
    ): Promise<TrainingSplitResponseDto> {
        return await this.trainingSplitService.patchValidated(
            id,
            patchDto,
            user,
        );
    }

    @Put(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a training split' })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'The ID of the training split',
    })
    @ApiOkResponse({
        description: 'The training split has been successfully updated.',
        type: TrainingSplitResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Training split not found',
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
        @Body() updateDto: TrainingSplitUpdateDto,
        @JwtUser() user: JwtAuthenticatedUser,
    ): Promise<TrainingSplitResponseDto> {
        return await this.trainingSplitService.putValidated(
            id,
            updateDto,
            user,
        );
    }

    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a training split' })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'The ID of the training split',
    })
    @ApiOkResponse({
        description: 'The training split has been successfully deleted.',
    })
    @ApiNotFoundResponse({
        description: 'Training split not found',
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    async delete(
        @Param('id', ParseIntPipe) id: number,
        @JwtUser() user: JwtAuthenticatedUser,
    ): Promise<TrainingSplitResponseDto> {
        return await this.trainingSplitService.deleteValidated(id, user);
    }

    @Get()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all training splits' })
    @ApiQuery({
        name: 'scope',
        description: 'Scope of training splits to retrieve',
        required: false,
        schema: {
            type: 'string',
            enum: Object.values(FindAllScopes),
            default: FindAllScopes.AVAILABLE,
        },
    })
    @ApiOkResponse({
        description: 'List of all training splits',
        type: [TrainingSplitResponseDto],
    })
    @ApiNotFoundResponse({
        description: 'No training splits found',
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    @ApiBadRequestResponse({
        description: 'Invalid request',
    })
    async getAll(
        @JwtUser() user: JwtAuthenticatedUser,
        @Query('scope') scope: FindAllScopes = FindAllScopes.AVAILABLE,
    ): Promise<TrainingSplitResponseDto[]> {
        return await this.trainingSplitService.findAllAvailableAuthorized(
            user.id,
            user.roles,
            scope,
        );
    }

    @Get('assigned')
    @ApiBearerAuth()
    async getAssigned(
        @JwtUser() user: JwtAuthenticatedUser,
    ): Promise<TrainingSplitResponseDto> {
        return await this.trainingSplitService.findAssignedTrainingSplit(
            user.id,
        );
    }

    @Get(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get training split by ID' })
    @ApiQuery({
        name: 'scope',
        description: 'Scope of training splits to retrieve',
        required: false,
        schema: {
            type: 'string',
            enum: Object.values(FindAllScopes),
            default: FindAllScopes.AVAILABLE,
        },
    })
    @ApiOkResponse({
        description: 'The training split with the specified ID',
        type: TrainingSplitResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Training split not found',
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    @ApiBadRequestResponse({
        description: 'Invalid request',
    })
    async get(
        @Param('id', ParseIntPipe) id: number,
        @Query('scope') scope: FindAllScopes = FindAllScopes.AVAILABLE,
        @Query('withAllRelations') withAllRelations: boolean = false,
        @JwtUser() user: JwtAuthenticatedUser,
    ): Promise<TrainingSplitResponseDto> {
        if (withAllRelations) {
            return await this.trainingSplitService.findOneAvailableAuthorized(
                user.id,
                user.roles,
                scope,
                id,
                {
                    days: {
                        workoutSessionPlan: {
                            exercises: {
                                exercise: true,
                            },
                        },
                    },
                },
            );
        }

        return await this.trainingSplitService.findOneAvailableAuthorized(
            user.id,
            user.roles,
            scope,
            id,
            {
                days: true,
            },
        );
    }

    @Post('/:id/restore')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Restore a deleted training split' })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'The ID of the training split to restore',
    })
    @ApiOkResponse({
        description: 'The training split has been successfully restored.',
        type: TrainingSplitResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    @ApiNotFoundResponse({
        description: 'Training split not found',
    })
    @ApiForbiddenResponse({
        description: 'Cannot perform this restoration',
    })
    async restore(
        @Param('id', ParseIntPipe) id: number,
        @JwtUser() user: JwtAuthenticatedUser,
    ): Promise<TrainingSplitResponseDto> {
        return await this.trainingSplitService.restoreValidated(id, user);
    }
}
