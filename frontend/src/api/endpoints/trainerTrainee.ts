export const TRAINER_TRAINEE_ENDPOINTS = {
    trainerTraineeRequests: '/v1/trainer-trainees/requests',
    respondToTrainerRequest: (requestId: number) => `/v1/trainer-trainees/requests/respond/${requestId}`,
    trainerTrainees: '/v1/trainer-trainees/trainees',
}