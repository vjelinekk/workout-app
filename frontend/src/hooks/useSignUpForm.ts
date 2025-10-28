import { TRANSLATION_SECTION_KEYS } from "@/constants/locale";
import { signUpSchema } from "@/schemas/register";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

export const useSignUpForm = () => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.registerForm);

    const schema = signUpSchema(
        t('validation.emailInvalid'),
        t('validation.firstNameRequired'),
        t('validation.lastNameRequired'),
        t('validation.nickNameRequired'),
        t('validation.passwordMinLength'),
        t('validation.confirmPasswordRequired'),
        t('validation.passwordsDoNotMatch'),
    )

    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            email: '',
            firstName: '',
            lastName: '',
            nickname: '',
            password: '',
            confirmPassword: '',
        },
    });

    return form;
}