import { BecomeTrainerFormValues } from "@/schemas/becomeTrainer";
import { api } from "../axios";
import { USER_ENDPOINTS } from "../endpoints/user";
import { handleApiError } from "@/utils/apiError";
import { UserResponse } from "@/types/user";

export const becomeTrainer = async (becomeTrainerData: BecomeTrainerFormValues): Promise<void> => {
    try {
        await api.post(`${USER_ENDPOINTS.becomeTrainer}`, becomeTrainerData);
    } catch (error: unknown) {
        handleApiError(error, 'Failed to submit become trainer request');
    }
}

export const fetchAllUsers = async (trainerRequests?: boolean, signal?: AbortSignal): Promise<UserResponse[]> => {
    try {
        const params = trainerRequests ? { trainerRequests: true } : {};

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