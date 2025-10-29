import { assignTrainingSplit, fetchTrainingSplitAssignments, resolveTrainingSplitAssignment } from "@/api/services/trainingSplitAssignment";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { QUERY_KEY_TRAINER_TRAINEES } from "./useTrainerTrainees";
import { TrainingSplitAssignmentResponse, TrainingSplitAssignmentStatus } from "@/types/trainingSplitAssignment";
import { ApiError } from "@/utils/apiError";
import { QUERY_KEY_TRAINING_SPLIT_ASSIGNED_TO_USER } from "@/api/services/trainingSplit";

export const QUERY_KEY_TRAINING_SPLIT_ASSIGNMENTS = 'training-split-assignments';
export const useTrainingSplitAssignments = (
    statuses: TrainingSplitAssignmentStatus[]
) => {
    const { data, isLoading, error } = useQuery<TrainingSplitAssignmentResponse[], ApiError>({
        queryKey: [QUERY_KEY_TRAINING_SPLIT_ASSIGNMENTS, { statuses }],
        queryFn: ({ signal }) => fetchTrainingSplitAssignments(statuses, signal),
    })

    return { data, isLoading, error }
}

export const useCreateTrainingSplitAssignment = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, { traineeId: number; trainingSplitId: number }>({
        mutationFn: async ({ traineeId, trainingSplitId }) => {
            await assignTrainingSplit(traineeId, trainingSplitId)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEY_TRAINER_TRAINEES],
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEY_TRAINING_SPLIT_ASSIGNED_TO_USER],
            })
        }
    })
}

export const useResolveTrainingSplitAssignment = () => {
    const queryClient = useQueryClient();

    return useMutation<void, ApiError, { assignmentId: number; accept: boolean }>({
        mutationFn: async ({ assignmentId, accept }) => {
            await resolveTrainingSplitAssignment(assignmentId, accept)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEY_TRAINING_SPLIT_ASSIGNMENTS],
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEY_TRAINING_SPLIT_ASSIGNED_TO_USER],
            })
        }
    })
}