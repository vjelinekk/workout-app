export enum UserRole {
    ADMIN = 1,
    TRAINEE = 2,
    TRAINER = 3,
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResult {
    token: string;
    user: User;
}

export interface LoginResponse {
    accessToken: string;
    userId: number;
    userFirstName: string;
    userLastName: string;
    userNickname: string;
    userEmail: string;
    roles: UserRole[];
}

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    nickname: string;
    email: string;
    roles: UserRole[];
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}
