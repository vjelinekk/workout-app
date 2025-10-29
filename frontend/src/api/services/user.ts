import { BecomeTrainerFormValues } from "@/schemas/becomeTrainer";
import { api } from "../axios";
import { USER_ENDPOINTS } from "../endpoints/user";
import { handleApiError } from "@/utils/apiError";
import { UserResponse } from "@/types/user";
import { UserRole } from "@/types/auth";

export const becomeTrainer = async (becomeTrainerData: BecomeTrainerFormValues): Promise<void> => {
    try {
        await api.post(`${USER_ENDPOINTS.becomeTrainer}`, becomeTrainerData);
    } catch (error: unknown) {
        handleApiError(error, 'Failed to submit become trainer request');
    }
}

export const fetchAllUsers = async (
    trainerRequests?: boolean,
    roles?: UserRole[],
    notRecruitedOrPending?: boolean,
    signal?: AbortSignal
): Promise<UserResponse[]> => {
    try {
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
    } catch (error: unknown) {
        handleApiError(error, 'Failed to fetch users');
    }
}

export const fetchUserById = async (id: number, signal?: AbortSignal): Promise<UserResponse> => {
    try {
        const { data } = await api.get<UserResponse>(`${USER_ENDPOINTS.userById(id)}`, { signal });
        return data;
    } catch (error: unknown) {
        handleApiError(error, 'Failed to fetch user');
    }
}

export const resolveApplication = async (id: number, approve: boolean): Promise<void> => {
    try {
        await api.post(`${USER_ENDPOINTS.resolveTrainerApplication(id)}?approve=${approve}`);
    } catch (error: unknown) {
        handleApiError(error, 'Failed to resolve trainer application');
    }
}