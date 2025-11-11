import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
} from '@nestjs/common';
import { TrainerTraineeService } from '../services/trainer-trainee.service';
import { JwtUser } from 'src/modules/auth/decorators/jwt-user.decorator';
import type { JwtAuthenticatedUser } from 'src/modules/auth/types/jwt-authenticated-user.type';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { TrainerTraineeResponseDto } from '../dtos/trainer-trainee-response.dto';
import { TrainerTraineeRequestDto } from '../dtos/trainer-trainee-request.dto';
import { TrainerTraineeRespondDto } from '../dtos/trainer-trainee-respond.dto';
import { TrainerTraineeTraineeResponseDto } from '../dtos/trainer-trainee-trainee-response.dto';

/**
 * Trainer-Trainee relationship controller managing recruitment and assignments.
 * Handles trainer requests to recruit trainees and trainee responses to those requests.
 */
@ApiTags('Trainer-Trainee')
@Controller('trainer-trainees')
export class TrainerTraineeController {
    constructor(
        private readonly trainerTraineeService: TrainerTraineeService,
    ) {}

    @Post('requests/respond/:id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Respond to a trainer request' })
    @ApiBody({ type: TrainerTraineeRespondDto })
    @ApiOkResponse({ description: 'Trainer request responded successfully' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiBadRequestResponse({ description: 'Invalid input data' })
    async respondToTrainerRequest(
        @JwtUser() user: JwtAuthenticatedUser,
        @Body() body: TrainerTraineeRespondDto,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<void> {
        await this.trainerTraineeService.respondToTrainerRequest(
            body.accept,
            id,
            user.id,
        );
    }

    @Post('requests')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Send a trainer request to a trainee' })
    @ApiBody({ type: TrainerTraineeRequestDto })
    @ApiOkResponse({ description: 'Trainer request sent successfully' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiBadRequestResponse({ description: 'Invalid input data' })
    async sendTrainerRequest(
        @JwtUser() user: JwtAuthenticatedUser,
        @Body() body: TrainerTraineeRequestDto,
    ): Promise<void> {
        await this.trainerTraineeService.sendTrainerRequest(
            body.traineeId,
            user,
        );
    }

    @Get('requests')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get trainer requests for the logged in user' })
    @ApiOkResponse({
        description: 'List of trainer requests',
        type: [TrainerTraineeResponseDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    async getTrainerRequests(
        @JwtUser() user: JwtAuthenticatedUser,
    ): Promise<TrainerTraineeResponseDto[]> {
        return await this.trainerTraineeService.getTrainerRequests(user.id);
    }

    @Get('trainees')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get trainees assigned to the logged in trainer',
    })
    @ApiOkResponse({
        description: 'List of trainees',
        type: [TrainerTraineeTraineeResponseDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    async getTraineesForLoggedInTrainer(
        @JwtUser() user: JwtAuthenticatedUser,
    ): Promise<TrainerTraineeTraineeResponseDto[]> {
        return await this.trainerTraineeService.getTraineesForTrainer(user.id);
    }
}
