import { api } from "../axios";
import { Scope } from "@/types/scope";
import { handleApiError } from "@/utils/apiError";
import { TrainingSplit, TrainingSplitDay } from "@/types/trainingSplit";
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

    const trainingSplitId = data.id;
    
    const { data: trainingSplitData } = await api.get<TrainingSplitDay[]>(`${TRAINING_SPLIT_DAYS_ENDPOINTS.trainingSplitDays}`, {
        params: { training_split_id: trainingSplitId },
        signal,
    });

    const result: TrainingSplit = {
        ...data,
        training_split_days: trainingSplitData,
    }

    return result;
}

const mapTrainingSplitToApiFormat = (trainingSplit: TrainingSplitFormValues): {
    name: string;
    description: string;
    is_public: boolean;
    is_approved: boolean;
} => {
    return {
        name: trainingSplit.name,
        description: trainingSplit.description,
        is_public: trainingSplit.is_public,
        is_approved: trainingSplit.is_approved,
    }
}

export const createTrainingSplit = async (trainingSplit: TrainingSplitFormValues): Promise<TrainingSplit> => {
    try {
        const trainingSplitData = mapTrainingSplitToApiFormat(trainingSplit);

        const { data } = await api.post<TrainingSplit>(`${TRAINING_SPLIT_ENDPOINTS.trainingSplits}`, trainingSplitData);

        const trainingSplitId = data.id;
        const trainingSplitWorkoutSessionPlans = trainingSplit.training_split_days.map(day => ({
            training_split_id: trainingSplitId,
            workout_session_plan_id: day.workout_session_plan_id,
            day_of_week: day.day_of_week,
        }));
        await api.post(`${TRAINING_SPLIT_DAYS_ENDPOINTS.bulk}`, trainingSplitWorkoutSessionPlans);
        
        return data;
    } catch (error: unknown) {
        handleApiError(error, 'Failed to create training split');
    }
}

export const updateTrainingSplit = async (id: number, trainingSplit: TrainingSplitFormValues): Promise<TrainingSplit> => {
    try {
        const trainingSplitData = mapTrainingSplitToApiFormat(trainingSplit);
        const { data } = await api.patch<TrainingSplit>(`${TRAINING_SPLIT_ENDPOINTS.trainingSplits}/${id}`, trainingSplitData);

        const trainingSplitId = data.id;
        const trainingSplitWorkoutSessionPlans = trainingSplit.training_split_days.map(day => ({
            training_split_id: trainingSplitId,
            workout_session_plan_id: day.workout_session_plan_id,
            day_of_week: day.day_of_week,
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