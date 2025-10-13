import { ExerciseCategory } from "@/types/exerciseCategory";
import { api } from "../axios";
import { EXERCISE_CATEGORIES_ENDPOINTS } from "../endpoints/exerciseCategory";

export const QUERY_KEY_EXERCISE_CATEGORIES = 'exercise-categories';
export const fetchAllExerciseCategories = async (signal?: AbortSignal) => {
    const { data } = await api.get<ExerciseCategory[]>(EXERCISE_CATEGORIES_ENDPOINTS.exerciseCategories, { signal });
    return data;
}