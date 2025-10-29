import { fetchTrainerTraineeRequests, fetchTrainerTrainees, respondToTrainerRequest, sendTrainerRequest } from "@/api/services/trainerTrainee";
import { TraineeResponse, TrainerTraineeResponse } from "@/types/trainerTrainee"
import { ApiError } from "@/utils/apiError"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { QUERY_KEY_USERS } from "./useUsers";

export const QUERY_KEY_TRAINER_TRAINEES = 'trainer-trainees';
export const useTrainerTrainees = () => {
    const { data, error, isLoading } = useQuery<TrainerTraineeResponse[], ApiError>({
        queryKey: [QUERY_KEY_TRAINER_TRAINEES],
        queryFn: ({ signal }) => fetchTrainerTraineeRequests(signal),
    })

    return { data, error, isLoading }
}

export const useSendTrainerRequest = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, { traineeId: number }>({
        mutationFn: ({ traineeId }) => sendTrainerRequest(traineeId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEY_USERS],
            });
        },
    })
}

export const useTrainees = () => {
    const { data, error, isLoading } = useQuery<TraineeResponse[], ApiError>({
        queryKey: [QUERY_KEY_TRAINER_TRAINEES],
        queryFn: ({ signal }) => fetchTrainerTrainees(signal),
    })

    return { data, error, isLoading }
}

export const useRespondToTrainerRequest = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, { requestId: number; accept: boolean }>({
        mutationFn: ({ requestId, accept }) => respondToTrainerRequest(requestId, accept),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEY_TRAINER_TRAINEES],
            });
        },
    })
}