import { SessionLoggingData, WorkoutSession } from "@/types/workoutSession"
import { api } from "../axios"
import { WORKOUT_SESSION_ENDPOINTS } from "../endpoints/workoutSession"

/**
 * Fetches a single workout session by ID.
 * Errors are automatically transformed to ApiError by axios interceptor.
 * @throws ApiError if fetch fails
 */
export const fetchWorkoutSessionById = async (
    workoutSessionId: number,
    signal?: AbortSignal,
): Promise<WorkoutSession> => {
    const { data } = await api.get<WorkoutSession>(`${WORKOUT_SESSION_ENDPOINTS.workoutSessions}/${workoutSessionId}`, { signal })

    return data;
}

/**
 * Starts a new workout session.
 * Errors are automatically transformed to ApiError by axios interceptor.
 * @throws ApiError if start fails
 */
export const startWorkoutSession = async (
    workoutSessionPlanId: number,
    trainingSplitId: number
): Promise<WorkoutSession> => {
    const { data } = await api.post<WorkoutSession>(`${WORKOUT_SESSION_ENDPOINTS.start}`, {
        workoutSessionPlanId,
        trainingSplitId
    })

    return data;
}

export const logWorkoutSessionProgress = async (
    workoutSessionId: number,
    progressData: SessionLoggingData,
): Promise<WorkoutSession> => {
    const { data } = await api.put<WorkoutSession>(`${WORKOUT_SESSION_ENDPOINTS.logProgress}/${workoutSessionId}`, { 
        progressData 
    });

    return data;
}

export const finishWorkoutSession = async (
    workoutSessionId: number,
    progressData: SessionLoggingData
): Promise<void> => {
    await api.put(`${WORKOUT_SESSION_ENDPOINTS.finish(workoutSessionId)}`, { progressData });
}

export const fetchWorkoutSessionInProgress = async (signal?: AbortSignal): Promise<WorkoutSession | null> => {
    const { data } = await api.get<WorkoutSession | null>(`${WORKOUT_SESSION_ENDPOINTS.inProgress}`, {
        signal,
    });

    return data;
}

export const syncWorkoutSessionTime = async (): Promise<void> => {
    await api.patch(`${WORKOUT_SESSION_ENDPOINTS.syncTime}`);
}