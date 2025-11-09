import { api } from "../axios";
import { TRAINER_TRAINEE_ENDPOINTS } from "../endpoints/trainerTrainee";
import { TraineeResponse, TrainerTraineeResponse } from "@/types/trainerTrainee";

/**
 * Fetches all pending trainer-trainee requests for the current user.
 * Errors are automatically transformed to ApiError by axios interceptor.
 * @throws ApiError if fetch fails
 */
export const fetchTrainerTraineeRequests = async (signal: AbortSignal) => {
    const { data } = await api.get<TrainerTraineeResponse[]>(TRAINER_TRAINEE_ENDPOINTS.trainerTraineeRequests, {
        signal
    });

    return data;
};

/**
 * Sends a trainer request to a specific trainee.
 * Errors are automatically transformed to ApiError by axios interceptor.
 * @throws ApiError if request fails
 */
export const sendTrainerRequest = async (traineeId: number): Promise<void> => {
    await api.post<void>(TRAINER_TRAINEE_ENDPOINTS.trainerTraineeRequests, {
        traineeId,
    });
}

/**
 * Fetches all trainer-trainee relationships for the current trainer.
 * Errors are automatically transformed to ApiError by axios interceptor.
 * @throws ApiError if fetch fails
 */
export const fetchTrainerTrainees = async (signal: AbortSignal) => {
    const { data } = await api.get<TraineeResponse[]>(TRAINER_TRAINEE_ENDPOINTS.trainerTrainees, {
        signal
    });

    return data;
}

/**
 * Responds to a pending trainer request (accept or deny).
 * Errors are automatically transformed to ApiError by axios interceptor.
 * @throws ApiError if response fails
 */
export const respondToTrainerRequest = async (requestId: number, accept: boolean): Promise<void> => {
    await api.post<void>(`${TRAINER_TRAINEE_ENDPOINTS.respondToTrainerRequest(requestId)}`, {
        accept,
    });
}