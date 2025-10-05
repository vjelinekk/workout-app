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
import { TrainingSplitDayService } from '../services/training-split-day.service';
import { TrainingSplitDayCreateDto } from '../dtos/training-split-day/training-split-day-create.dto';
import { TrainingSplitDayResponseDto } from '../dtos/training-split-day/training-split-day-response.dto';
import { TrainingSplitDayPatchDto } from '../dtos/training-split-day/training-split-day-patch.dto';
import { TrainingSplitDayUpdateDto } from '../dtos/training-split-day/training-split-day-update.dto';
import { JwtUser } from 'src/modules/auth/decorators/jwt-user.decorator';
import type { JwtAuthenticatedUser } from 'src/modules/auth/types/jwt-authenticated-user.type';

@ApiTags('Training Split Days')
@Controller('training-split-days')
export class TrainingSplitDayController {
    constructor(
        private readonly trainingSplitDayService: TrainingSplitDayService,
    ) {}

    @Post()
    @ApiOperation({ summary: 'Create a new training split day' })
    @ApiBody({
        type: TrainingSplitDayCreateDto,
        description: 'Training split day creation data',
    })
    @ApiOkResponse({
        description: 'The training split day has been successfully created.',
        type: TrainingSplitDayResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    @ApiBadRequestResponse({
        description: 'Invalid input data',
    })
    async create(
        @Body() createDto: TrainingSplitDayCreateDto,
        @JwtUser() user: JwtAuthenticatedUser,
    ): Promise<TrainingSplitDayResponseDto> {
        return await this.trainingSplitDayService.createMapped(
            createDto,
            user.id,
        );
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Patch a training split day' })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'The ID of the training split day',
    })
    @ApiOkResponse({
        description: 'The training split day has been successfully patched.',
        type: TrainingSplitDayResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Training split day not found',
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
        @Body() patchDto: TrainingSplitDayPatchDto,
        @JwtUser() user: JwtAuthenticatedUser,
    ): Promise<TrainingSplitDayResponseDto> {
        return await this.trainingSplitDayService.patchValidated(
            id,
            patchDto,
            user,
        );
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a training split day' })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'The ID of the training split day',
    })
    @ApiOkResponse({
        description: 'The training split day has been successfully updated.',
        type: TrainingSplitDayResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Training split day not found',
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
        @Body() updateDto: TrainingSplitDayUpdateDto,
        @JwtUser() user: JwtAuthenticatedUser,
    ): Promise<TrainingSplitDayResponseDto> {
        return await this.trainingSplitDayService.putValidated(
            id,
            updateDto,
            user,
        );
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a training split day' })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'The ID of the training split day',
    })
    @ApiOkResponse({
        description: 'The training split day has been successfully deleted.',
    })
    @ApiNotFoundResponse({
        description: 'Training split day not found',
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    async delete(
        @Param('id', ParseIntPipe) id: number,
        @JwtUser() user: JwtAuthenticatedUser,
    ): Promise<TrainingSplitDayResponseDto> {
        return await this.trainingSplitDayService.deleteValidated(id, user);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get training split day by ID' })
    @ApiOkResponse({
        description: 'The training split day with the specified ID',
        type: TrainingSplitDayResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Training split day not found',
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
    ): Promise<TrainingSplitDayResponseDto> {
        return await this.trainingSplitDayService.findByIdActiveValidated(
            id,
            user,
        );
    }

    @Get()
    @ApiOperation({ summary: 'Get all training split days' })
    @ApiOkResponse({
        description: 'List of all training split days',
        type: [TrainingSplitDayResponseDto],
    })
    @ApiNotFoundResponse({
        description: 'No training split days found',
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    @ApiBadRequestResponse({
        description: 'Invalid request',
    })
    async getAll(
        @JwtUser() user: JwtAuthenticatedUser,
    ): Promise<TrainingSplitDayResponseDto[]> {
        return await this.trainingSplitDayService.findAllActiveMapped();
    }

    @Post('/:id/restore')
    @ApiOperation({ summary: 'Restore a deleted training split day' })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'The ID of the training split day to restore',
    })
    @ApiOkResponse({
        description: 'The training split day has been successfully restored.',
        type: TrainingSplitDayResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    @ApiNotFoundResponse({
        description: 'Training split day not found',
    })
    @ApiForbiddenResponse({
        description: 'Cannot perform this restoration',
    })
    async restore(
        @Param('id', ParseIntPipe) id: number,
        @JwtUser() user: JwtAuthenticatedUser,
    ): Promise<TrainingSplitDayResponseDto> {
        return await this.trainingSplitDayService.restoreValidated(id, user);
    }
}