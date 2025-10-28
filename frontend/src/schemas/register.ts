import * as z from 'zod';

export const signUpSchema = (
    emailValidation: string,
    firstNameValidation: string,
    lastNameValidation: string,
    nickNameValidation: string,
    passwordValidation: string,
    confirmPasswordValidation: string,
    mismatchValidation: string,
) => z.object({
    email: z.email(emailValidation),
    firstName: z.string().min(1, firstNameValidation),
    lastName: z.string().min(1, lastNameValidation),
    nickname: z.string().min(1, nickNameValidation),
    password: z.string().min(6, passwordValidation),
    confirmPassword: z.string().min(1, confirmPasswordValidation),
}).refine((data) => data.password === data.confirmPassword, {
    message: mismatchValidation,
    path: ['confirmPassword'],
});

export type SignUpFormValues = z.infer<ReturnType<typeof signUpSchema>>;