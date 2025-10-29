import { becomeTrainer, fetchAllUsers, fetchUserById, resolveApplication } from "@/api/services/user"
import { BecomeTrainerFormValues } from "@/schemas/becomeTrainer"
import { UserRole } from "@/types/auth"
import { UserResponse } from "@/types/user"
import { ApiError } from "@/utils/apiError"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const useBecomeTrainer = () => {
    return useMutation<void, ApiError, BecomeTrainerFormValues>({
        mutationFn: (becomeTrainerData) => becomeTrainer(becomeTrainerData),
    })
}

export const QUERY_KEY_USERS = 'users'
export const useUsers = (
    trainerRequests?: boolean,
    roles?: UserRole[],
    notRecruitedOrPending?: boolean
) => {
    const { data, error, isLoading, isError } =  useQuery<UserResponse[], ApiError>({
        queryKey: [QUERY_KEY_USERS],
        queryFn: ({ signal }) => fetchAllUsers(trainerRequests, roles, notRecruitedOrPending, signal),
    })

    return { data, error, isLoading, isError }
}

export const QUERY_KEY_USER = 'user'
export const useUser = (id: number) => {
    const { data, error, isLoading, isError } = useQuery<UserResponse, ApiError>({
        queryKey: [QUERY_KEY_USER, id],
        queryFn: ({ signal }) => fetchUserById(id, signal),
    })

    return { data, error, isLoading, isError }
}

export const useResolveApplication = () => {
    const queryClient = useQueryClient();

    return useMutation<void, ApiError, { id: number; approve: boolean }>({
        mutationFn: ({ id, approve }) => resolveApplication(id, approve),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEY_USERS],
            });
        },
    })
}