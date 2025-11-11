import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseArrayPipe,
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
import { TrainingSplitAssignmentService } from '../services/training-split-assignment.service';
import { TrainingSplitAssignmentCreateDto } from '../dtos/training-split-assignment/training-split-assignment-create.dto';
import { TrainingSplitAssignmentResponseDto } from '../dtos/training-split-assignment/training-split-assignment-response.dto';
import { TrainingSplitAssignmentPatchDto } from '../dtos/training-split-assignment/training-split-assignment-patch.dto';
import { TrainingSplitAssignmentUpdateDto } from '../dtos/training-split-assignment/training-split-assignment-update.dto';
import { JwtUser } from 'src/modules/auth/decorators/jwt-user.decorator';
import type { JwtAuthenticatedUser } from 'src/modules/auth/types/jwt-authenticated-user.type';
import { TrainingSplitAssignmentStatusEnum } from '../enums/training-split-assignment-status.enum';

/**
 * Training split assignment controller managing assignment of training plans to trainees.
 * Handles trainer-to-trainee workout plan assignments with status tracking (active/completed).
 */
@ApiTags('Training Split Assignments')
@Controller('training-split-assignments')
export class TrainingSplitAssignmentController {
    constructor(
        private readonly trainingSplitAssignmentService: TrainingSplitAssignmentService,
    ) {}

    @Post()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new training split assignment' })
    @ApiBody({
        type: TrainingSplitAssignmentCreateDto,
        description: 'Training split assignment creation data',
    })
    @ApiOkResponse({
        description:
            'The training split assignment has been successfully created.',
        type: TrainingSplitAssignmentResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    @ApiBadRequestResponse({
        description: 'Invalid input data',
    })
    async create(
        @Body() createDto: TrainingSplitAssignmentCreateDto,
        @JwtUser() user: JwtAuthenticatedUser,
    ): Promise<TrainingSplitAssignmentResponseDto> {
        return await this.trainingSplitAssignmentService.createValidated(
            createDto,
            user,
        );
    }

    @Patch(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Patch a training split assignment' })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'The ID of the training split assignment',
    })
    @ApiOkResponse({
        description:
            'The training split assignment has been successfully patched.',
        type: TrainingSplitAssignmentResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Training split assignment not found',
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
        @Body() patchDto: TrainingSplitAssignmentPatchDto,
        @JwtUser() user: JwtAuthenticatedUser,
    ): Promise<TrainingSplitAssignmentResponseDto> {
        return await this.trainingSplitAssignmentService.patchValidated(
            id,
            patchDto,
            user,
        );
    }

    @Put(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a training split assignment' })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'The ID of the training split assignment',
    })
    @ApiOkResponse({
        description:
            'The training split assignment has been successfully updated.',
        type: TrainingSplitAssignmentResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Training split assignment not found',
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
        @Body() updateDto: TrainingSplitAssignmentUpdateDto,
        @JwtUser() user: JwtAuthenticatedUser,
    ): Promise<TrainingSplitAssignmentResponseDto> {
        return await this.trainingSplitAssignmentService.putValidated(
            id,
            updateDto,
            user,
        );
    }

    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a training split assignment' })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'The ID of the training split assignment',
    })
    @ApiOkResponse({
        description:
            'The training split assignment has been successfully deleted.',
    })
    @ApiNotFoundResponse({
        description: 'Training split assignment not found',
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    async delete(
        @Param('id', ParseIntPipe) id: number,
        @JwtUser() user: JwtAuthenticatedUser,
    ): Promise<TrainingSplitAssignmentResponseDto> {
        return await this.trainingSplitAssignmentService.deleteValidated(
            id,
            user,
        );
    }

    @Get(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get training split assignment by ID' })
    @ApiOkResponse({
        description: 'The training split assignment with the specified ID',
        type: TrainingSplitAssignmentResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Training split assignment not found',
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
    ): Promise<TrainingSplitAssignmentResponseDto> {
        return await this.trainingSplitAssignmentService.findByIdActiveValidated(
            id,
            user,
        );
    }

    @Get()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all training split assignments' })
    @ApiOkResponse({
        description: 'List of all training split assignments',
        type: [TrainingSplitAssignmentResponseDto],
    })
    @ApiQuery({
        name: 'statuses',
        required: false,
        description:
            'Filter assignments by their statuses (e.g., PENDING, ACCEPTED, DECLINED)',
        type: 'string',
        enum: TrainingSplitAssignmentStatusEnum,
        isArray: true,
    })
    @ApiNotFoundResponse({
        description: 'No training split assignments found',
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    @ApiBadRequestResponse({
        description: 'Invalid request',
    })
    async getAll(
        @JwtUser() user: JwtAuthenticatedUser,
        @Query('statuses', new ParseArrayPipe({ optional: true }))
        statuses?: TrainingSplitAssignmentStatusEnum[],
    ): Promise<TrainingSplitAssignmentResponseDto[]> {
        return await this.trainingSplitAssignmentService.findAllActiveForUserMapped(
            user.id,
            statuses,
        );
    }

    @Post('/:id/resolve')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Resolve a training split assignment' })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'The ID of the training split assignment to resolve',
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                accept: {
                    type: 'boolean',
                    description: 'Whether to accept or decline the assignment',
                },
            },
            required: ['accept'],
        },
    })
    @ApiOkResponse({
        description:
            'The training split assignment has been successfully resolved.',
    })
    @ApiBadRequestResponse({
        description: 'Invalid input data',
    })
    @ApiNotFoundResponse({
        description: 'Training split assignment not found',
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    async resolveAssignment(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: { accept: boolean },
        @JwtUser() user: JwtAuthenticatedUser,
    ) {
        return await this.trainingSplitAssignmentService.resolveAssignment(
            id,
            body.accept,
            user,
        );
    }

    @Post('/:id/restore')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Restore a deleted training split assignment' })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'The ID of the training split assignment to restore',
    })
    @ApiOkResponse({
        description:
            'The training split assignment has been successfully restored.',
        type: TrainingSplitAssignmentResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    @ApiNotFoundResponse({
        description: 'Training split assignment not found',
    })
    @ApiForbiddenResponse({
        description: 'Cannot perform this restoration',
    })
    async restore(
        @Param('id', ParseIntPipe) id: number,
        @JwtUser() user: JwtAuthenticatedUser,
    ): Promise<TrainingSplitAssignmentResponseDto> {
        return await this.trainingSplitAssignmentService.restoreValidated(
            id,
            user,
        );
    }
}
