import { QUERY_KEY_EXERCISE, QUERY_KEY_EXERCISES, createExercise, deleteExercise, fetchAllExercises, fetchExerciseById, updateExercise } from "@/api/services/exercise"
import { ExerciseFormValues } from "@/schemas/exercise"
import { ApiError } from "@/utils/apiError";
import { Exercise } from "@/types/exercise"
import { Scope } from "@/types/scope"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const useExercises = (scope: Scope) => {
    const { data, error, isLoading } = useQuery<Exercise[], ApiError>({
        queryKey: [QUERY_KEY_EXERCISES, scope],
        queryFn: ({ signal }) => fetchAllExercises(scope, signal),
    })

    return { data, error, isLoading }
}

export const useExercise = (id: number) => {
    const { data, error, isLoading } = useQuery<Exercise, ApiError>({
        queryKey: [QUERY_KEY_EXERCISES, QUERY_KEY_EXERCISE, id],
        queryFn: ({ signal }) => fetchExerciseById(id, signal),
    })

    return { data, error, isLoading }
}

export const useCreateExercise = () => {
    const queryClient = useQueryClient()

    return useMutation<Exercise, Error, ExerciseFormValues>({
        mutationFn: (exercise) => createExercise(exercise),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEY_EXERCISES, QUERY_KEY_EXERCISE],
            })
        }
    })
}

export const useUpdateExercise = () => {
    const queryClient = useQueryClient()

    return useMutation<Exercise, Error, { id: number; exercise: ExerciseFormValues }>({
        mutationFn: ({ id, exercise }) => updateExercise(id, exercise),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEY_EXERCISES],
            })
        }
    })
}

export const useDeleteExercise = () => {
    const queryClient = useQueryClient()

    return useMutation<Exercise, Error, { id: number }>({
        mutationFn: ({ id }) => deleteExercise(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEY_EXERCISES],
            })
        }
    })
}