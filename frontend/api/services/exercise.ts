import { Exercise } from "@/types/exercise";
import { api } from "../axios";
import { EXERCISE_ENDPOINTS } from "../endpoints/exercise";
import { Scope } from "@/types/scope";

export const QUERY_KEY_EXERCISES = 'all-exercises';
export const fetchAllExercises = async (scope: Scope = Scope.ALL) => {
    const data = await api.get<Exercise[]>(EXERCISE_ENDPOINTS.exercises, {
        params: { scope },
    });

    return data.data;
}