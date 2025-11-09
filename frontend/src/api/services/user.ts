import { BecomeTrainerFormValues } from "@/schemas/becomeTrainer";
import { api } from "../axios";
import { USER_ENDPOINTS } from "../endpoints/user";
import { UserResponse } from "@/types/user";
import { UserRole } from "@/types/auth";

/**
 * Submits a request to become a trainer.
 * Errors are automatically transformed to ApiError by axios interceptor.
 * @throws ApiError if submission fails
 */
export const becomeTrainer = async (becomeTrainerData: BecomeTrainerFormValues): Promise<void> => {
    await api.post(`${USER_ENDPOINTS.becomeTrainer}`, becomeTrainerData);
}

/**
 * Fetches all users with optional filtering by trainer requests, roles, or recruitment status.
 * Errors are automatically transformed to ApiError by axios interceptor.
 * @throws ApiError if fetch fails
 */
export const fetchAllUsers = async (
    trainerRequests?: boolean,
    roles?: UserRole[],
    notRecruitedOrPending?: boolean,
    signal?: AbortSignal
): Promise<UserResponse[]> => {
    const params: {
        trainerRequests?: boolean;
        roles?: string;
        notRecruitedOrPending?: boolean;
    } = {};

    if (trainerRequests !== undefined) {
        params.trainerRequests = trainerRequests;
    }

    if (roles !== undefined && roles.length > 0) {
        params.roles = roles.join('&roles=');
    }

    if (notRecruitedOrPending !== undefined) {
        params.notRecruitedOrPending = notRecruitedOrPending;
    }

    const { data } = await api.get<UserResponse[]>(`${USER_ENDPOINTS.users}`, { signal, params });

    return data;
}

/**
 * Fetches a single user by ID.
 * Errors are automatically transformed to ApiError by axios interceptor.
 * @throws ApiError if fetch fails
 */
export const fetchUserById = async (id: number, signal?: AbortSignal): Promise<UserResponse> => {
    const { data } = await api.get<UserResponse>(`${USER_ENDPOINTS.userById(id)}`, { signal });
    return data;
}

/**
 * Resolves a trainer application by approving or denying it.
 * Errors are automatically transformed to ApiError by axios interceptor.
 * @throws ApiError if resolution fails
 */
export const resolveApplication = async (id: number, approve: boolean): Promise<void> => {
    await api.post(`${USER_ENDPOINTS.resolveTrainerApplication(id)}?approve=${approve}`);
}