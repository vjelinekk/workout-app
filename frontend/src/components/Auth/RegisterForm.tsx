import { RegisterFormValues, registerSchema } from '@/schemas/register';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { BasicInputField } from '../BasicForm/BasicInputField';
import { BasicForm } from '../BasicForm/BasicForm';
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
        void data;
        setError(''); // Clear previous errors
        return Promise.resolve();
    };

    return (
        <BasicForm<RegisterFormValues>
            form={form}
            onSubmit={(data) => void onSubmit(data)}
            submitLabel="Register"
            submittingLabel="Registering..."
        >
            <BasicInputField<RegisterFormValues>
                name="email"
                label="Email"
                placeholder="user@example.com"
                autoComplete="email"
                control={form.control}
                type="email"
            />

            <BasicInputField<RegisterFormValues>
                name="firstName"
                label="First Name"
                placeholder="John"
                autoComplete="given-name"
                control={form.control}
            />

            <BasicInputField<RegisterFormValues>
                name="lastName"
                label="Last Name"
                placeholder="Doe"
                autoComplete="family-name"
                control={form.control}
            />

            <BasicInputField<RegisterFormValues>
                name="nickName"
                label="Nickname"
                placeholder="Johnny"
                autoComplete="nickname"
                control={form.control}
            />

            <BasicInputField<RegisterFormValues>
                name="password"
                label="Password"
                placeholder="********"
                autoComplete="new-password"
                control={form.control}
                type="password"
            />

            <BasicInputField<RegisterFormValues>
                name="confirmPassword"
                label="Confirm Password"
                placeholder="********"
                autoComplete="new-password"
                control={form.control}
                type="password"
            />
        </BasicForm>
    );
};
