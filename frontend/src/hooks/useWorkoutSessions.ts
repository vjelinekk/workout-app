import { fetchWorkoutSessionById, fetchWorkoutSessionInProgress, finishWorkoutSession, logWorkoutSessionProgress, startWorkoutSession, syncWorkoutSessionTime } from "@/api/services/workoutSession";
import { ApiErrorResponse } from "@/types/api";
import { SessionLoggingData, WorkoutSession } from "@/types/workoutSession";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const QUERY_KEY_WORKOUT_SESSION = 'workout-session';
export const useWorkoutSession = (workoutSessionId: number) => {
    const queryClient = useQueryClient();

    return useQuery<WorkoutSession, ApiErrorResponse>({
        queryKey: [QUERY_KEY_WORKOUT_SESSION, workoutSessionId],
        queryFn: ({ signal }) => fetchWorkoutSessionById(workoutSessionId, signal),
        initialData: () => queryClient.getQueryData<WorkoutSession>([QUERY_KEY_WORKOUT_SESSION, workoutSessionId]),
    });
}

export const useStartWorkoutSession = () => {
    return useMutation<WorkoutSession, Error, { workoutSessionPlanId: number; trainingSplitId: number }>({
        mutationFn: ({ workoutSessionPlanId, trainingSplitId }) =>
            startWorkoutSession(workoutSessionPlanId, trainingSplitId),
    });
}

export const useLogSessionProgress = () => {
    const queryClient = useQueryClient();

    return useMutation<WorkoutSession, Error, { id: number, progressData: SessionLoggingData }>({
        mutationFn: ({ id, progressData }) => logWorkoutSessionProgress(id, progressData),
        onSuccess: (data) => {
            queryClient.setQueryData([QUERY_KEY_WORKOUT_SESSION, data.id], data);
        },
    })
}

export const useFinishWorkoutSession = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, { workoutSessionId: number, progressData: SessionLoggingData }>({
        mutationFn: ({ workoutSessionId, progressData }) => finishWorkoutSession(workoutSessionId, progressData),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEY_WORKOUT_SESSION],
            });
            queryClient.removeQueries({
                queryKey: [QUERY_KEY_WORKOUT_SESSION_IN_PROGRESS],
            });
        },
    })
}

export const QUERY_KEY_WORKOUT_SESSION_IN_PROGRESS = 'workout-session-in-progress';
export const useWorkoutSessionInProgress = () => {
    return useQuery<WorkoutSession | null, ApiErrorResponse>({
        queryKey: [QUERY_KEY_WORKOUT_SESSION_IN_PROGRESS],
        queryFn: ({ signal }) => fetchWorkoutSessionInProgress(signal),
        retry: 1,
    });
}

export const useSyncWorkoutSessionTime = () => {
    return useMutation<void, Error>({
        mutationFn: () => {
            return syncWorkoutSessionTime();
        },
    });
}
