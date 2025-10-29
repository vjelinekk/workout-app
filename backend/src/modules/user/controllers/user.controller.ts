import {
    Body,
    Controller,
    Get,
    Param,
    ParseArrayPipe,
    ParseBoolPipe,
    Post,
    Query,
} from '@nestjs/common';
import { BecomeTrainerDto } from '../dtos/become-trainer.dto';
import { UserService } from '../services/user.service';
import { MailService } from 'src/modules/mail/services/mail.service';
import { JwtUser } from 'src/modules/auth/decorators/jwt-user.decorator';
import type { JwtAuthenticatedUser } from 'src/modules/auth/types/jwt-authenticated-user.type';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from 'src/modules/auth/decorators/role.decorator';
import { RoleEnum } from '../enums/role.enum';
import { UserResponseDto } from '../dtos/user-response.dto';

@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly mailService: MailService,
    ) {}

    @Post('/become-trainer')
    @ApiOperation({ summary: 'Request to become a trainer' })
    @ApiBody({
        type: BecomeTrainerDto,
        description: 'Data for becoming a trainer',
    })
    @ApiOkResponse({ description: 'Trainer request submitted successfully' })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    @ApiNotFoundResponse({
        description: 'User not found',
    })
    @ApiBadRequestResponse({
        description: 'Invalid input data',
    })
    @ApiBearerAuth()
    async requestBecomeTrainer(
        @JwtUser() jwtUser: JwtAuthenticatedUser,
        @Body() dto: BecomeTrainerDto,
    ): Promise<void> {
        const user = await this.userService.requestBecomeTrainer(
            jwtUser.id,
            dto.reason,
        );
        const adminEmails = await this.userService.findAllAdminsEmails();
        await this.mailService.becomeATrainer(
            adminEmails,
            user.nickname,
            dto.reason,
        );
    }

    @Get('')
    @ApiOperation({
        summary: 'Get all users',
    })
    @ApiOkResponse({
        type: [UserResponseDto],
        description: 'List of users retrieved successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    @ApiBadRequestResponse({
        description: 'Invalid query parameters',
    })
    @ApiQuery({
        name: 'trainerRequests',
        required: false,
        type: Boolean,
        description: 'Filter users who have requested to become trainers',
    })
    @ApiQuery({
        name: 'roles',
        required: false,
        description:
            'Filter users by roles, mapping: ' +
            Object.values(RoleEnum).join(', '),
        type: 'number',
        isArray: true,
        enum: RoleEnum,
    })
    @ApiQuery({
        name: 'notRecruitedOrPending',
        required: false,
        type: Boolean,
        description:
            'Filter users who are not yet recruited and do not have pending recruitment',
    })
    @ApiBearerAuth()
    async getAll(
        @JwtUser() jwtUser: JwtAuthenticatedUser,
        @Query('trainerRequests', new ParseBoolPipe({ optional: true }))
        trainerRequests?: boolean,
        @Query('roles', new ParseArrayPipe({ optional: true, items: Number }))
        roles?: RoleEnum[],
        @Query('notRecruitedOrPending', new ParseBoolPipe({ optional: true }))
        notRecruitedOrPending?: boolean,
    ): Promise<UserResponseDto[]> {
        return await this.userService.getAll(
            jwtUser,
            trainerRequests,
            roles,
            notRecruitedOrPending,
        );
    }

    @Get('/:id')
    @ApiOperation({ summary: 'Get a user by ID' })
    @ApiParam({
        name: 'id',
        required: true,
        type: Number,
        description: 'ID of the user to retrieve',
    })
    @ApiOkResponse({
        type: UserResponseDto,
        description: 'User retrieved successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    @ApiNotFoundResponse({
        description: 'User not found',
    })
    @ApiBearerAuth()
    async getOne(@Param('id') id: number): Promise<UserResponseDto> {
        return await this.userService.findByIdProfile(id);
    }

    @Post('/trainer-application/:id')
    @Roles(RoleEnum.ADMIN)
    @ApiOperation({ summary: 'Resolve a trainer application' })
    @ApiQuery({
        name: 'approve',
        required: true,
        type: Boolean,
        description: 'Approve or deny the trainer application',
    })
    @ApiParam({
        name: 'id',
        required: true,
        type: Number,
        description:
            'ID of the user whose trainer application is to be resolved',
    })
    @ApiOkResponse({ description: 'Trainer application resolved successfully' })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    @ApiNotFoundResponse({
        description: 'User or trainer application not found',
    })
    @ApiBadRequestResponse({
        description: 'Invalid input data',
    })
    @ApiBearerAuth()
    async resolveApplication(
        @Param('id') id: number,
        @Query('approve') approve: boolean,
    ): Promise<void> {
        await this.userService.resolveTrainerApplication(id, approve);
    }
}
