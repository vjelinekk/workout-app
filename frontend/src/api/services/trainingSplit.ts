import { api } from "../axios";
import { Scope } from "@/types/scope";
import { TrainingSplit } from "@/types/trainingSplit";
import { TRAINING_SPLIT_DAYS_ENDPOINTS, TRAINING_SPLIT_ENDPOINTS } from "../endpoints/trainingSplit";
import { TrainingSplitFormValues } from "@/schemas/trainingSplit";

export const QUERY_KEY_TRAINING_SPLITS = 'training-splits';
/**
 * Fetches all training splits matching the given scope.
 * Errors are automatically transformed to ApiError by axios interceptor.
 * @throws ApiError if fetch fails
 */
export const fetchAllTrainingSplits = async (
    scope: Scope = Scope.ALL,
    signal?: AbortSignal
) => {
    const { data } = await api.get<TrainingSplit[]>(TRAINING_SPLIT_ENDPOINTS.trainingSplits, {
        params: { scope },
        signal,
    });
    return data;
}

export const QUERY_KEY_TRAINING_SPLIT = 'training-split';
/**
 * Fetches a single training split by ID.
 * Errors are automatically transformed to ApiError by axios interceptor.
 * @throws ApiError if fetch fails
 */
export const fetchTrainingSplitById = async (id: number, signal?: AbortSignal): Promise<TrainingSplit> => {
    const { data } = await api.get<TrainingSplit>(`${TRAINING_SPLIT_ENDPOINTS.trainingSplits}/${id}`, { signal });
    return data;
}

export const QUERY_KEY_TRAINING_SPLIT_ASSIGNED_TO_USER = 'training-split-assigned-to-user';
/**
 * Fetches the training split assigned to the current user.
 * Errors are automatically transformed to ApiError by axios interceptor.
 * @throws ApiError if fetch fails
 */
export const fetchTrainingSplitAssignedToUser = async (signal?: AbortSignal): Promise<TrainingSplit> => {
    const { data } = await api.get<TrainingSplit>(`${TRAINING_SPLIT_ENDPOINTS.assigned}`, { signal });
    return data;
}

const mapTrainingSplitToApiFormat = (trainingSplit: TrainingSplitFormValues): {
    name: string;
    description: string;
    isPublic: boolean;
    isApproved: boolean;
} => {
    return {
        name: trainingSplit.name,
        description: trainingSplit.description,
        isPublic: trainingSplit.isPublic,
        isApproved: trainingSplit.isApproved,
    }
}

/**
 * Creates a new training split with associated workout session plans for each day.
 * Errors are automatically transformed to ApiError by axios interceptor.
 * @throws ApiError if creation fails
 */
export const createTrainingSplit = async (trainingSplit: TrainingSplitFormValues): Promise<TrainingSplit> => {
    const { data } = await api.post<TrainingSplit>(`${TRAINING_SPLIT_ENDPOINTS.trainingSplits}`, mapTrainingSplitToApiFormat(trainingSplit));

    const trainingSplitId = data.id;
    const trainingSplitWorkoutSessionPlans = trainingSplit.days.map(day => ({
        trainingSplitId: trainingSplitId,
        workoutSessionPlanId: day.workoutSessionPlanId,
        dayOfWeek: day.dayOfWeek,
    }));
    await api.post(`${TRAINING_SPLIT_DAYS_ENDPOINTS.bulk}`, trainingSplitWorkoutSessionPlans);

    return data;
}

/**
 * Updates an existing training split and its associated workout session plans.
 * Errors are automatically transformed to ApiError by axios interceptor.
 * @throws ApiError if update fails
 */
export const updateTrainingSplit = async (id: number, trainingSplit: TrainingSplitFormValues): Promise<TrainingSplit> => {
    const { data } = await api.patch<TrainingSplit>(`${TRAINING_SPLIT_ENDPOINTS.trainingSplits}/${id}`, mapTrainingSplitToApiFormat(trainingSplit));

    const trainingSplitId = data.id;
    const trainingSplitWorkoutSessionPlans = trainingSplit.days.map(day => ({
        trainingSplitId: trainingSplitId,
        workoutSessionPlanId: day.workoutSessionPlanId,
        dayOfWeek: day.dayOfWeek,
    }));
    await api.put(`${TRAINING_SPLIT_DAYS_ENDPOINTS.bulk}`, trainingSplitWorkoutSessionPlans, {
        params: {
            training_split_id: trainingSplitId,
        }
    });

    return data;
}

/**
 * Deletes a training split.
 * Errors are automatically transformed to ApiError by axios interceptor.
 * @throws ApiError if deletion fails
 */
export const deleteTrainingSplit = async (id: number): Promise<TrainingSplit> => {
    const { data } = await api.delete(`${TRAINING_SPLIT_ENDPOINTS.trainingSplits}/${id}`);
    return data;
}