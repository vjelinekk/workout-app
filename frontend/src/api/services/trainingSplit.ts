import { api } from "../axios";
import { Scope } from "@/types/scope";
import { handleApiError } from "@/utils/apiError";
import { TrainingSplit } from "@/types/trainingSplit";
import { TRAINING_SPLIT_DAYS_ENDPOINTS, TRAINING_SPLIT_ENDPOINTS } from "../endpoints/trainingSplit";
import { TrainingSplitFormValues } from "@/schemas/trainingSplit";

export const QUERY_KEY_TRAINING_SPLITS = 'training-splits';
export const fetchAllTrainingSplits = async (
    scope: Scope = Scope.ALL,
    signal?: AbortSignal
) => {
    const data = await api.get<TrainingSplit[]>(TRAINING_SPLIT_ENDPOINTS.trainingSplits, {
        params: { scope },
        signal,
    });

    return data.data;
}

export const QUERY_KEY_TRAINING_SPLIT = 'training-split';
export const fetchTrainingSplitById = async (id: number, signal?: AbortSignal): Promise<TrainingSplit> => {
    const { data } = await api.get<TrainingSplit>(`${TRAINING_SPLIT_ENDPOINTS.trainingSplits}/${id}`, { signal });

    return data;
}

export const QUERY_KEY_TRAINING_SPLIT_ASSIGNED_TO_USER = 'training-split-assigned-to-user';
export const fetchTrainingSplitAssignedToUser = async (signal?: AbortSignal): Promise<TrainingSplit> => {
    try {
        const { data } = await api.get<TrainingSplit>(`${TRAINING_SPLIT_ENDPOINTS.assigned}`, { signal });
        return data;
    } catch (error: unknown) {
        handleApiError(error, 'Failed to fetch training split assigned to user');
    }
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

export const createTrainingSplit = async (trainingSplit: TrainingSplitFormValues): Promise<TrainingSplit> => {
    try {
        const { data } = await api.post<TrainingSplit>(`${TRAINING_SPLIT_ENDPOINTS.trainingSplits}`, mapTrainingSplitToApiFormat(trainingSplit));

        const trainingSplitId = data.id;
        const trainingSplitWorkoutSessionPlans = trainingSplit.days.map(day => ({
            trainingSplitId: trainingSplitId,
            workoutSessionPlanId: day.workoutSessionPlanId,
            dayOfWeek: day.dayOfWeek,
        }));
        await api.post(`${TRAINING_SPLIT_DAYS_ENDPOINTS.bulk}`, trainingSplitWorkoutSessionPlans);
        
        return data;
    } catch (error: unknown) {
        handleApiError(error, 'Failed to create training split');
    }
}

export const updateTrainingSplit = async (id: number, trainingSplit: TrainingSplitFormValues): Promise<TrainingSplit> => {
    try {
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
    } catch (error: unknown) {
        handleApiError(error, 'Failed to update training split');
    }
}

export const deleteTrainingSplit = async (id: number): Promise<TrainingSplit> => {
    try {
        const { data } = await api.delete(`${TRAINING_SPLIT_ENDPOINTS.trainingSplits}/${id}`);
        return data;
    } catch (error: unknown) {
        handleApiError(error, 'Failed to delete training split');
    }
}