import { api } from "../axios"
import { TRAINING_SPLIT_ASSIGNMENT_ENDPOINTS } from "../endpoints/trainingSplitAssignment"
import { TrainingSplitAssignmentResponse, TrainingSplitAssignmentStatus } from "@/types/trainingSplitAssignment"

export const fetchTrainingSplitAssignments = async (statuses: TrainingSplitAssignmentStatus[], signal: AbortSignal) => {
    const statusParams = statuses.map(status => `statuses=${status}`).join(',');
    const { data } = await api.get<TrainingSplitAssignmentResponse[]>(`${TRAINING_SPLIT_ASSIGNMENT_ENDPOINTS.fetchTrainingSplitAssignments}?${statusParams}`, {
        signal,
    })

    return data
}

export const assignTrainingSplit = async (traineeId: number, trainingSplitId: number) => {
    await api.post(TRAINING_SPLIT_ASSIGNMENT_ENDPOINTS.assignTrainingSplit, {
        traineeId,
        trainingSplitId,
    })
}

export const resolveTrainingSplitAssignment = async (assignmentId: number, accept: boolean) => {
    await api.post(TRAINING_SPLIT_ASSIGNMENT_ENDPOINTS.resolveTrainingSplitAssignment(assignmentId), {
        accept,
    })
}