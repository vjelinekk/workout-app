export const USER_ENDPOINTS = {
    users: '/v1/users', 
    becomeTrainer: '/v1/users/become-trainer',
    resolveTrainerApplication: (id: number) => `/v1/users/trainer-application/${id}`,
    userById: (id: number) => `/v1/users/${id}`,
}