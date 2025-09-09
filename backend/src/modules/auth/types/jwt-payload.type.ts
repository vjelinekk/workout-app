export interface JwtPayload {
    nickname: string;
    sub: number;
    roles: number[];
}
