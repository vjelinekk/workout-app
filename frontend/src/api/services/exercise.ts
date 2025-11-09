import { Exercise } from "@/types/exercise";
import { api } from "../axios";
import { EXERCISE_ENDPOINTS } from "../endpoints/exercise";
import { Scope } from "@/types/scope";
import { ExerciseFormValues } from "@/schemas/exercise";
import { LOCAL_STORAGE_KEYS } from '@/constants/localStorage';

export const QUERY_KEY_EXERCISES = 'exercises';
/**
 * Fetches all exercises matching the given scope.
 * Errors are automatically transformed to ApiError by axios interceptor.
 * @throws ApiError if fetch fails
 */
export const fetchAllExercises = async (
    scope: Scope = Scope.ALL,
    signal?: AbortSignal
) => {
    const { data } = await api.get<Exercise[]>(EXERCISE_ENDPOINTS.exercises, {
        params: { scope },
        signal,
    });
    return data;
}

export const QUERY_KEY_EXERCISE = 'exercise';
/**
 * Fetches a single exercise by ID.
 * Errors are automatically transformed to ApiError by axios interceptor.
 * @throws ApiError if fetch fails
 */
export const fetchExerciseById = async (id: number, signal?: AbortSignal): Promise<Exercise> => {
    const { data } = await api.get<Exercise>(`${EXERCISE_ENDPOINTS.exercises}/${id}`, { signal });
    return data;
}

/**
 * Creates a new exercise.
 * Errors are automatically transformed to ApiError by axios interceptor.
 * @throws ApiError if creation fails
 */
export const createExercise = async (exercise: ExerciseFormValues): Promise<Exercise> => {
    const { data } = await api.post<Exercise>(EXERCISE_ENDPOINTS.exercises, exercise);
    return data;
}

/**
 * Updates an existing exercise.
 * Errors are automatically transformed to ApiError by axios interceptor.
 * @throws ApiError if update fails
 */
export const updateExercise = async (id: number, exercise: ExerciseFormValues): Promise<Exercise> => {
    const { data } = await api.patch<Exercise>(`${EXERCISE_ENDPOINTS.exercises}/${id}`, exercise);
    return data;
}

/**
 * Deletes an exercise.
 * Errors are automatically transformed to ApiError by axios interceptor.
 * @throws ApiError if deletion fails
 */
export const deleteExercise = async (id: number): Promise<Exercise> => {
    const { data } = await api.delete(`${EXERCISE_ENDPOINTS.exercises}/${id}`);
    return data;
}

/**
 * Uploads an exercise image file.
 * Errors are automatically transformed to ApiError by axios interceptor.
 * @throws ApiError if upload fails
 */
export const uploadExerciseImage = async (file: File): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);

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
};