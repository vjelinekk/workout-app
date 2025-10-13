import { Exercise } from "@/types/exercise";
import { api } from "../axios";
import { EXERCISE_ENDPOINTS } from "../endpoints/exercise";
import { Scope } from "@/types/scope";
import { ExerciseFormValues } from "@/schemas/exercise";
import { handleApiError } from "@/utils/apiError";

export const QUERY_KEY_EXERCISES = 'exercises';
export const fetchAllExercises = async (
    scope: Scope = Scope.ALL,
    signal?: AbortSignal
) => {
    const data = await api.get<Exercise[]>(EXERCISE_ENDPOINTS.exercises, {
        params: { scope },
        signal,
    });

    return data.data;
}

export const QUERY_KEY_EXERCISE = 'exercise';
export const fetchExerciseById = async (id: number, signal?: AbortSignal): Promise<Exercise> => {
    const { data } = await api.get<Exercise>(`${EXERCISE_ENDPOINTS.exercises}/${id}`, { signal });
    return data;
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