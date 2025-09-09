import { Controller, Get, Request, UseGuards } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { JwtUser } from "src/modules/auth/decorators/jwt-user.decorator";
import { Roles } from "src/modules/auth/decorators/role.decorator";
import { RoleGuard } from "src/modules/auth/guards/role.guard";
import type { AuthenticatedRequest } from "src/modules/auth/types/authenticated-request.type";
import type { JwtAuthenticatedUser } from "src/modules/auth/types/jwt-authenticated-user.type";
import { RoleEnum } from "../enums/role.enum";

@Controller('user')
export class UserController {
    constructor() {}

    @Get('full')
    @UseGuards(RoleGuard)
    @Roles(RoleEnum.ADMIN)
    full(@Request() req: AuthenticatedRequest) {
        console.log(req);
    }

    @Get('simple')
    @UseGuards(RoleGuard)
    @Roles(RoleEnum.TRAINEE)
    simple(@JwtUser() user: JwtAuthenticatedUser) {
        console.log(user);
    }
}