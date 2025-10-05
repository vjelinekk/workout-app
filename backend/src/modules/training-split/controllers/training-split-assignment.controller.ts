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
import { TrainingSplitAssignmentService } from '../services/training-split-assignment.service';
import { TrainingSplitAssignmentCreateDto } from '../dtos/training-split-assignment/training-split-assignment-create.dto';
import { TrainingSplitAssignmentResponseDto } from '../dtos/training-split-assignment/training-split-assignment-response.dto';
import { TrainingSplitAssignmentPatchDto } from '../dtos/training-split-assignment/training-split-assignment-patch.dto';
import { TrainingSplitAssignmentUpdateDto } from '../dtos/training-split-assignment/training-split-assignment-update.dto';
import { JwtUser } from 'src/modules/auth/decorators/jwt-user.decorator';
import type { JwtAuthenticatedUser } from 'src/modules/auth/types/jwt-authenticated-user.type';

@ApiTags('Training Split Assignments')
@Controller('training-split-assignments')
export class TrainingSplitAssignmentController {
    constructor(
        private readonly trainingSplitAssignmentService: TrainingSplitAssignmentService,
    ) {}

    @Post()
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
        return await this.trainingSplitAssignmentService.createMapped(
            createDto,
            user.id,
        );
    }

    @Patch(':id')
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
    @ApiOperation({ summary: 'Get all training split assignments' })
    @ApiOkResponse({
        description: 'List of all training split assignments',
        type: [TrainingSplitAssignmentResponseDto],
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
    ): Promise<TrainingSplitAssignmentResponseDto[]> {
        return await this.trainingSplitAssignmentService.findAllActiveMapped();
    }

    @Post('/:id/restore')
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