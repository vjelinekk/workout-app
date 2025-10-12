import { QUERY_KEY_EXERCISES, fetchAllExercises } from "@/api/services/exercise"
import { ApiErrorResponse } from "@/types/api"
import { Exercise } from "@/types/exercise"
import { Scope } from "@/types/scope"
import { useQuery } from "@tanstack/react-query"

export const useExercises = (scope: Scope) => {
    const { data, error, isLoading } = useQuery<Exercise[], ApiErrorResponse>({
        queryKey: [QUERY_KEY_EXERCISES, scope],
        queryFn: () => fetchAllExercises(scope),
    })

    return { data, error, isLoading }
}