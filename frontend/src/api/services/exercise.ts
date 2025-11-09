import { Exercise } from "@/types/exercise";
import { api } from "../axios";
import { EXERCISE_ENDPOINTS } from "../endpoints/exercise";
import { Scope } from "@/types/scope";
import { ExerciseFormValues } from "@/schemas/exercise";
import { handleApiError } from "@/utils/apiError";
import { LOCAL_STORAGE_KEYS } from '@/constants/localStorage';

export const QUERY_KEY_EXERCISES = 'exercises';
export const fetchAllExercises = async (
    scope: Scope = Scope.ALL,
    signal?: AbortSignal
) => {
    try {
        const data = await api.get<Exercise[]>(EXERCISE_ENDPOINTS.exercises, {
            params: { scope },
            signal,
        });

        return data.data;
    } catch (error: unknown) {
        handleApiError(error, 'Failed to fetch exercises');
    }
}

export const QUERY_KEY_EXERCISE = 'exercise';
export const fetchExerciseById = async (id: number, signal?: AbortSignal): Promise<Exercise> => {
    try {
        const { data } = await api.get<Exercise>(`${EXERCISE_ENDPOINTS.exercises}/${id}`, { signal });
        return data;
    } catch (error: unknown) {
        handleApiError(error, 'Failed to fetch exercise');
    }
}

export const createExercise = async (exercise: ExerciseFormValues): Promise<Exercise> => {
    try {
        const { data } = await api.post<Exercise>(EXERCISE_ENDPOINTS.exercises, exercise);
        return data;
    } catch (error: unknown) {
        handleApiError(error, 'Failed to create exercise');
    }
}

export const updateExercise = async (id: number, exercise: ExerciseFormValues): Promise<Exercise> => {
    try {
        const { data } = await api.patch<Exercise>(`${EXERCISE_ENDPOINTS.exercises}/${id}`, exercise);
        return data;
    } catch (error: unknown) {
        handleApiError(error, 'Failed to update exercise');
    }
}

export const deleteExercise = async (id: number): Promise<Exercise> => {
    try {
        const { data } = await api.delete(`${EXERCISE_ENDPOINTS.exercises}/${id}`);
        return data;
    } catch (error: unknown) {
        handleApiError(error, 'Failed to delete exercise');
    }
}

export const uploadExerciseImage = async (file: File): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const { data } = await api.post<{ imageUrl: string }>(
            EXERCISE_ENDPOINTS.uploadImage,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            },
        );
        return data;
    } catch (error: unknown) {
        handleApiError(error, 'Failed to upload image');
    }
};