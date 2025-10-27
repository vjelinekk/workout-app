import { createTrainingSplit, deleteTrainingSplit, fetchAllTrainingSplits, fetchTrainingSplitAssignedToUser, fetchTrainingSplitById, QUERY_KEY_TRAINING_SPLIT, QUERY_KEY_TRAINING_SPLIT_ASSIGNED_TO_USER, QUERY_KEY_TRAINING_SPLITS, updateTrainingSplit } from "@/api/services/trainingSplit"
import { TrainingSplitFormValues } from "@/schemas/trainingSplit"
import { ApiErrorResponse } from "@/types/api"
import { Scope } from "@/types/scope"
import { TrainingSplit } from "@/types/trainingSplit"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const useTrainingSplits = (scope: Scope) => {
    const { data, error, isLoading } = useQuery<TrainingSplit[], ApiErrorResponse>({
        queryKey: [QUERY_KEY_TRAINING_SPLITS, scope],
        queryFn: ({ signal }) => fetchAllTrainingSplits(scope, signal),
    })

    return { data, error, isLoading }
}

export const useTrainingSplit = (id: number) => {
    const { data, error, isLoading } = useQuery<TrainingSplit, ApiErrorResponse>({
        queryKey: [QUERY_KEY_TRAINING_SPLITS, QUERY_KEY_TRAINING_SPLIT, id],
        queryFn: ({ signal }) => fetchTrainingSplitById(id, signal),
    })

    return { data, error, isLoading }
}

export const useTrainingSplitAssignedToUser = () => {
    const { data, error, isLoading } = useQuery<TrainingSplit, ApiErrorResponse>({
        queryKey: [QUERY_KEY_TRAINING_SPLIT_ASSIGNED_TO_USER],
        queryFn: ({ signal }) => fetchTrainingSplitAssignedToUser(signal),
    })

    return { data, error, isLoading }
}

export const useCreateTrainingSplit = () => {
    const queryClient = useQueryClient()

    return useMutation<TrainingSplit, Error, TrainingSplitFormValues>({
        mutationFn: (trainingSplit) => createTrainingSplit(trainingSplit),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEY_TRAINING_SPLITS, QUERY_KEY_TRAINING_SPLIT],
            })
        }
    })
}

export const useUpdateTrainingSplit = () => {
    const queryClient = useQueryClient()

    return useMutation<TrainingSplit, Error, { id: number; trainingSplit: TrainingSplitFormValues }>({
        mutationFn: ({ id, trainingSplit }) => updateTrainingSplit(id, trainingSplit),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEY_TRAINING_SPLITS],
            })
        }
    })
}

export const useDeleteTrainingSplit = () => {
    const queryClient = useQueryClient()

    return useMutation<TrainingSplit, Error, { id: number }>({
        mutationFn: ({ id }) => deleteTrainingSplit(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEY_TRAINING_SPLITS],
            })
        }
    })
}