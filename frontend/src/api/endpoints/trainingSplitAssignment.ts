export const TRAINING_SPLIT_ASSIGNMENT_ENDPOINTS = {
    assignTrainingSplit: '/v1/training-split-assignments',
    fetchTrainingSplitAssignments: '/v1/training-split-assignments',
    resolveTrainingSplitAssignment: (id: number) => `/v1/training-split-assignments/${id}/resolve`,
}