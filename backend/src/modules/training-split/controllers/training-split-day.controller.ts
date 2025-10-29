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
    @ApiBearerAuth()
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

    @Post('bulk')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create training split days in bulk' })
    @ApiBody({
        type: [TrainingSplitDayCreateDto],
        description: 'Array of training split day creation data',
    })
    @ApiOkResponse({
        description: 'The training split days have been successfully created.',
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    @ApiBadRequestResponse({
        description: 'Invalid input data',
    })
    async createBulk(
        @Body() createDtos: TrainingSplitDayCreateDto[],
        @JwtUser() user: JwtAuthenticatedUser,
    ): Promise<void> {
        await this.trainingSplitDayService.createBulk(createDtos, user);
    }

    @Patch(':id')
    @ApiBearerAuth()
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

    @Put('bulk')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update training split days in bulk' })
    @ApiQuery({
        name: 'training_split_id',
        required: true,
        type: Number,
        description: 'The ID of the training split to which the days belong',
    })
    @ApiBody({
        type: [TrainingSplitDayCreateDto],
        description: 'Array of training split day creation data',
    })
    @ApiOkResponse({
        description: 'The training split days have been successfully updated.',
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    @ApiBadRequestResponse({
        description: 'Invalid input data',
    })
    async updateBulk(
        @Body() createDtos: TrainingSplitDayCreateDto[],
        @Query('training_split_id', ParseIntPipe) trainingSplitId: number,
        @JwtUser() user: JwtAuthenticatedUser,
    ): Promise<void> {
        await this.trainingSplitDayService.updateBulk(
            trainingSplitId,
            createDtos,
            user,
        );
    }

    @Put(':id')
    @ApiBearerAuth()
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
    @ApiBearerAuth()
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

    @Get()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all training split days' })
    @ApiQuery({
        name: 'trainingSplitId',
        required: false,
        type: Number,
        description: 'Filter by training split ID',
    })
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
        @Query('training_split_id', new ParseIntPipe({ optional: true }))
        trainingSplitId?: number,
    ): Promise<TrainingSplitDayResponseDto[]> {
        if (trainingSplitId) {
            return await this.trainingSplitDayService.findAllByTrainingSplitIdActiveMapped(
                trainingSplitId,
            );
        }

        return await this.trainingSplitDayService.findAllActiveMapped();
    }

    @Get(':id')
    @ApiBearerAuth()
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

    @Post('/:id/restore')
    @ApiBearerAuth()
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
