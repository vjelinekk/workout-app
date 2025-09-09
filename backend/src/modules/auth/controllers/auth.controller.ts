import {
    Controller,
    Post,
    UseGuards,
    Request,
    Get,
    HttpStatus,
    Body,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginDto } from '../dtos/login.dto';
import { LoginResponseDto } from '../dtos/login-response.dto';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { AuthenticatedUser } from '../decorators/authenticated-user.decorator';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Public()
    @Post('login')
    @UseGuards(LocalAuthGuard)
    @ApiOperation({ summary: 'Login with email and password' })
    @ApiBody({ type: LoginDto, description: 'Login credentials' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful login',
        type: LoginResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
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
    googleAuthRedirect(@AuthenticatedUser() user: UserEntity) {
        return this.authService.login(user);
    }
}
