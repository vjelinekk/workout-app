import { RegisterFormValues, registerSchema } from '@/schemas/register';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { AuthInputField } from './AuthInputField';
import { AuthForm } from './AuthForm';
import { Dispatch, SetStateAction } from 'react';

interface Props {
    setError: Dispatch<SetStateAction<string>>;
}

export const RegisterForm = ({ setError }: Props) => {
    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: '',
            firstName: '',
            lastName: '',
            nickName: '',
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = (data: RegisterFormValues): Promise<void> => {
        // TODO: implement registration
        setError(''); // Clear previous errors
        console.log(data);
        return Promise.resolve();
    };

    return (
        <AuthForm<RegisterFormValues>
            form={form}
            onSubmit={onSubmit}
            submitLabel="Register"
            submittingLabel="Registering..."
        >
            <AuthInputField<RegisterFormValues>
                name="email"
                label="Email"
                placeholder="user@example.com"
                autoComplete="email"
                control={form.control}
                type="email"
            />

            <AuthInputField<RegisterFormValues>
                name="firstName"
                label="First Name"
                placeholder="John"
                autoComplete="given-name"
                control={form.control}
            />

            <AuthInputField<RegisterFormValues>
                name="lastName"
                label="Last Name"
                placeholder="Doe"
                autoComplete="family-name"
                control={form.control}
            />

            <AuthInputField<RegisterFormValues>
                name="nickName"
                label="Nickname"
                placeholder="Johnny"
                autoComplete="nickname"
                control={form.control}
            />

            <AuthInputField<RegisterFormValues>
                name="password"
                label="Password"
                placeholder="********"
                autoComplete="new-password"
                control={form.control}
                type="password"
            />

            <AuthInputField<RegisterFormValues>
                name="confirmPassword"
                label="Confirm Password"
                placeholder="********"
                autoComplete="new-password"
                control={form.control}
                type="password"
            />
        </AuthForm>
    );
};
