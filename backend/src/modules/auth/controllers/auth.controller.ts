import {
    Controller,
    Post,
    UseGuards,
    Get,
    Res,
    InternalServerErrorException,
    Body,
    UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { Public } from 'src/common/decorators/public.decorator';
import {
    ApiBody,
    ApiOkResponse,
    ApiOperation,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginDto } from '../dtos/login.dto';
import { LoginResponseDto } from '../dtos/login-response.dto';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { AuthenticatedUser } from '../decorators/authenticated-user.decorator';
import type { Response } from 'express';
import { AuthCodeService } from '../services/auth-code.service';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private authCodeService: AuthCodeService,
        private configService: ConfigService,
    ) {}

    @Public()
    @Post('login')
    @UseGuards(LocalAuthGuard)
    @ApiOperation({ summary: 'Login with email and password' })
    @ApiBody({ type: LoginDto, description: 'Login credentials' })
    @ApiOkResponse({
        description: 'Successful login',
        type: LoginResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid credentials',
    })
    login(@AuthenticatedUser() user: UserEntity) {
        return this.authService.login(user);
    }

    @Public()
    @Get('google')
    @UseGuards(GoogleAuthGuard)
    @ApiOperation({ summary: 'Login with Google OAuth2' })
    async googleAuth() {}

    @Public()
    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    @ApiOperation({ summary: 'Google OAuth2 callback' })
    googleAuthRedirect(
        @AuthenticatedUser() user: UserEntity,
        @Res() res: Response,
    ) {
        const loginResponse = this.authService.login(user);

        const authCode = this.authCodeService.generateAuthCode(loginResponse);

        const frontendUrl = this.configService.get<string>('FRONTEND_URL');
        if (!frontendUrl) {
            throw new InternalServerErrorException(
                'FRONTEND_URL is not defined',
            );
        }
        const redirectUrl = new URL('/auth/callback', frontendUrl);
        redirectUrl.searchParams.append('code', authCode);

        return res.redirect(redirectUrl.toString());
    }

    @Public()
    @Post('exchange-code')
    @ApiOperation({ summary: 'Exchange auth code for login response' })
    @ApiBody({ type: String, description: 'Authorization code' })
    exchangeAuthCode(@Body('code') code: string) {
        const loginResponse = this.authCodeService.exchangeAuthCode(code);
        if (!loginResponse) {
            throw new UnauthorizedException('Invalid or expired auth code');
        }

        return loginResponse;
    }
}
