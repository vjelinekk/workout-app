export interface JwtAuthenticatedUser {
    userId: number;
    nickname: string;
    roles: number[];
}
