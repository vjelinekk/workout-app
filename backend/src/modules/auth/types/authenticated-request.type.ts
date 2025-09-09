import { Request } from "express";
import { JwtAuthenticatedUser } from "./jwt-authenticated-user.type";

export interface AuthenticatedRequest extends Request {
    user: JwtAuthenticatedUser;
}