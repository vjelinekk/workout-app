import { createWorkoutSessionPlan, deleteWorkoutSessionPlan, fetchAllWorkoutSessionPlans, fetchWorkoutSessionPlanById, QUERY_KEY_WORKOUT_SESSION_PLAN, QUERY_KEY_WORKOUT_SESSION_PLANS, updateWorkoutSessionPlan } from "@/api/services/workoutSessionPlan"
import { WorkoutSessionPlanFormValues } from "@/schemas/workoutSessionPlan"
import { ApiErrorResponse } from "@/types/api"
import { Scope } from "@/types/scope"
import { WorkoutSessionPlan } from "@/types/workoutSessionPlan"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const useWorkoutSessionPlans = (scope: Scope) => {
    const { data, error, isLoading } = useQuery<WorkoutSessionPlan[], ApiErrorResponse>({
        queryKey: [QUERY_KEY_WORKOUT_SESSION_PLANS, scope],
        queryFn: ({ signal }) => fetchAllWorkoutSessionPlans(scope, signal),
    })

    return { data, error, isLoading }
}

export const useWorkoutSessionPlan = (id: number) => {
    const { data, error, isLoading } = useQuery<WorkoutSessionPlan, ApiErrorResponse>({
        queryKey: [QUERY_KEY_WORKOUT_SESSION_PLANS, QUERY_KEY_WORKOUT_SESSION_PLAN, id],
        queryFn: ({ signal }) => fetchWorkoutSessionPlanById(id, signal),
    })

    return { data, error, isLoading }
}

export const useCreateWorkoutSessionPlan = () => {
    const queryClient = useQueryClient()

    return useMutation<WorkoutSessionPlan, Error, WorkoutSessionPlanFormValues>({
        mutationFn: (workoutSessionPlan) => createWorkoutSessionPlan(workoutSessionPlan),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEY_WORKOUT_SESSION_PLANS, QUERY_KEY_WORKOUT_SESSION_PLAN],
            })
        }
    })
}

export const useUpdateWorkoutSessionPlan = () => {
    const queryClient = useQueryClient()

    return useMutation<WorkoutSessionPlan, Error, { id: number; workoutSessionPlan: WorkoutSessionPlanFormValues }>({
        mutationFn: ({ id, workoutSessionPlan }) => updateWorkoutSessionPlan(id, workoutSessionPlan),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEY_WORKOUT_SESSION_PLANS],
            })
        }
    })
}

export const useDeleteWorkoutSessionPlan = () => {
    const queryClient = useQueryClient()

    return useMutation<WorkoutSessionPlan, Error, { id: number }>({
        mutationFn: ({ id }) => deleteWorkoutSessionPlan(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEY_WORKOUT_SESSION_PLANS],
            })
        }
    })
}