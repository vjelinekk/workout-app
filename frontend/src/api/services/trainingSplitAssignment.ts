import { handleApiError } from "@/utils/apiError"
import { api } from "../axios"
import { TRAINING_SPLIT_ASSIGNMENT_ENDPOINTS } from "../endpoints/trainingSplitAssignment"
import { TrainingSplitAssignmentResponse, TrainingSplitAssignmentStatus } from "@/types/trainingSplitAssignment"

export const fetchTrainingSplitAssignments = async (statuses: TrainingSplitAssignmentStatus[], signal: AbortSignal) => {
    try {
        const statusParams = statuses.map(status => `statuses=${status}`).join(',');
        const { data } = await api.get<TrainingSplitAssignmentResponse[]>(`${TRAINING_SPLIT_ASSIGNMENT_ENDPOINTS.fetchTrainingSplitAssignments}?${statusParams}`, {
            signal,
        })

        return data
    } catch (error: unknown) {
        handleApiError(error, 'Failed to fetch training split assignments')
    }
}

export const assignTrainingSplit = async (traineeId: number, trainingSplitId: number) => {
    try {
        await api.post(TRAINING_SPLIT_ASSIGNMENT_ENDPOINTS.assignTrainingSplit, {
            traineeId,
            trainingSplitId,
        })
    } catch (error: unknown) {
        handleApiError(error, 'Failed to assign training split')
    }
}

export const resolveTrainingSplitAssignment = async (assignmentId: number, accept: boolean) => {
    try {
        await api.post(TRAINING_SPLIT_ASSIGNMENT_ENDPOINTS.resolveTrainingSplitAssignment(assignmentId), {
            accept,
        })
    } catch (error: unknown) {
        handleApiError(error, 'Failed to resolve training split assignment')
    }
}