import { SignUpFormValues } from '@/schemas/register';
import { BasicInputField } from '../BasicForm/BasicInputField';
import { BasicForm } from '../BasicForm/BasicForm';
import { useSignUpForm } from '@/hooks/useSignUpForm';
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';
import { useTranslations } from 'next-intl';
import { useSignUp } from '@/hooks/useSignUp';
import { useAuth } from '@/contexts/AuthContext';

export const SignUpForm = () => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.registerForm);
    const form = useSignUpForm();
    const { mutateAsync: signUp } = useSignUp();
    const { signUp: signUpWithContext } = useAuth();

    const onSubmit = async (data: SignUpFormValues) => {
        const result = await signUp(data);
        await signUpWithContext(result);
    };

    return (
        <BasicForm<SignUpFormValues>
            form={form}
            onSubmit={(data) => void onSubmit(data)}
            submitLabel={t('submit')}
            submittingLabel={t('registering')}
        >
            <BasicInputField<SignUpFormValues>
                name="email"
                label="Email"
                placeholder="user@example.com"
                autoComplete="email"
                control={form.control}
                type="email"
                required
            />

            <BasicInputField<SignUpFormValues>
                name="firstName"
                label="First Name"
                placeholder="John"
                autoComplete="given-name"
                control={form.control}
                required
            />

            <BasicInputField<SignUpFormValues>
                name="lastName"
                label="Last Name"
                placeholder="Doe"
                autoComplete="family-name"
                control={form.control}
                required
            />

            <BasicInputField<SignUpFormValues>
                name="nickname"
                label="Nickname"
                placeholder="Johnny"
                autoComplete="nickname"
                control={form.control}
                required
            />

            <BasicInputField<SignUpFormValues>
                name="password"
                label="Password"
                placeholder="********"
                autoComplete="new-password"
                control={form.control}
                type="password"
                required
            />

            <BasicInputField<SignUpFormValues>
                name="confirmPassword"
                label="Confirm Password"
                placeholder="********"
                autoComplete="new-password"
                control={form.control}
                type="password"
                required
            />
        </BasicForm>
    );
};
