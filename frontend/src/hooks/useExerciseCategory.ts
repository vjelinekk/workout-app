import { fetchAllExerciseCategories, QUERY_KEY_EXERCISE_CATEGORIES } from "@/api/services/exerciseCategory"
import { ApiErrorResponse } from "@/types/api"
import { ExerciseCategory } from "@/types/exerciseCategory"
import { useQuery } from "@tanstack/react-query"

export const useExerciseCategories = () => {
    const { data, error, isLoading, isError, refetch } = useQuery<ExerciseCategory[], ApiErrorResponse>({
        queryKey: [QUERY_KEY_EXERCISE_CATEGORIES],
        queryFn: ({ signal }) => fetchAllExerciseCategories(signal),
    })

    return { data, error, isLoading, isError, refetch }
}