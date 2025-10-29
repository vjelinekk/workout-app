import { handleApiError } from "@/utils/apiError";
import { api } from "../axios";
import { TRAINER_TRAINEE_ENDPOINTS } from "../endpoints/trainerTrainee";
import { TraineeResponse, TrainerTraineeResponse } from "@/types/trainerTrainee";

export const fetchTrainerTraineeRequests = async (signal: AbortSignal) => {
    try {
        const { data } = await api.get<TrainerTraineeResponse[]>(TRAINER_TRAINEE_ENDPOINTS.trainerTraineeRequests, {
            signal
        });

        return data;
    } catch (error: unknown) {
        handleApiError(error, 'Failed to fetch trainer-trainee requests');
    }
};

export const sendTrainerRequest = async (traineeId: number): Promise<void> => {
    try {
        await api.post<void>(TRAINER_TRAINEE_ENDPOINTS.trainerTraineeRequests, {
            traineeId,
        });
    } catch (error: unknown) {
        handleApiError(error, 'Failed to send trainer request');
    }
}

export const fetchTrainerTrainees = async (signal: AbortSignal) => {
    try {
        const { data } = await api.get<TraineeResponse[]>(TRAINER_TRAINEE_ENDPOINTS.trainerTrainees, {
            signal
        });

        return data;
    } catch (error: unknown) {
        handleApiError(error, 'Failed to fetch trainer-trainee relationships');
    }
}

export const respondToTrainerRequest = async (requestId: number, accept: boolean): Promise<void> => {
    try {
        await api.post<void>(`${TRAINER_TRAINEE_ENDPOINTS.respondToTrainerRequest(requestId)}`, {
            accept,
        });
    } catch (error: unknown) {
        handleApiError(error, 'Failed to respond to trainer request');
    }
}