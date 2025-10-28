import { UserRole } from "./auth";

export interface UserResponse {
    id: number,
    firstName: string,
    lastName: string,
    nickname: string,
    email: string,
    roles: UserRole[],
    becomeTrainerReason?: string,
}