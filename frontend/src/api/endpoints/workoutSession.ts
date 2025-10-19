export const WORKOUT_SESSION_ENDPOINTS = {
    start: '/v1/workout-sessions',
    workoutSessions: '/v1/workout-sessions',
    logProgress: '/v1/workout-sessions',
    finish: (id: number) => `/v1/workout-sessions/${id}/finish`,
    inProgress: '/v1/workout-sessions/in-progress',
    syncTime: '/v1/workout-sessions/time/sync',
}