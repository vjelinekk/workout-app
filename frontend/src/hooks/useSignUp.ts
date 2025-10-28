import { signUp } from "@/api/services/auth"
import { SignUpFormValues } from "@/schemas/register"
import { LoginResponse } from "@/types/auth"
import { useMutation } from "@tanstack/react-query"

export const useSignUp = () => {
    return useMutation<LoginResponse, Error, SignUpFormValues>({
        mutationFn: (registerData) => signUp(registerData),
    })
}