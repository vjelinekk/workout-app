'use client';

import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';
import { useTranslations } from 'next-intl';
import { BasicForm } from '../BasicForm/BasicForm';
import { BasicTextareaField } from '../BasicForm/BasicTextareaField';
import { useBecomeTrainerForm } from '@/hooks/useBecomeTrainerForm';
import { BecomeTrainerFormValues } from '@/schemas/becomeTrainer';
import { useBecomeTrainer } from '@/hooks/useUsers';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';
import { BasicFormAlert } from '../BasicForm/BasicFormAlert';
import { useRouter } from 'next/navigation';

export const BecomeTrainer = () => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.becomeTrainerPage);
    const form = useBecomeTrainerForm();
    const {
        mutate: becomeTrainer,
        error,
        isError,
        isSuccess,
    } = useBecomeTrainer();
    const { user } = useAuth();
    const router = useRouter();

    const onSubmit = (data: BecomeTrainerFormValues) => {
        becomeTrainer(data);
        form.reset();
    };

    const dismissCallback = () => {
        router.push('/dashboard');
    };

    if (!user) {
        return null;
    }

    const isTrainerOrAdmin = user.roles.some((role) =>
        [UserRole.TRAINER, UserRole.ADMIN].includes(role),
    );
    if (isTrainerOrAdmin) {
        return (
            <div className="text-center py-10">
                <h2 className="text-xl font-semibold">
                    {t('alreadyTrainerTitle')}
                </h2>
                <p className="mt-4 text-muted-foreground">
                    {t('alreadyTrainerDescription')}
                </p>
            </div>
        );
    }

    return (
        <div className="mb-10">
            <div className="flex items-center justify-between mb-5">
                <h1 className="text-2xl font-semibold">{t('title')}</h1>
            </div>

            <BasicForm<BecomeTrainerFormValues>
                form={form}
                onSubmit={(data) => onSubmit(data)}
                submitLabel={t('submit')}
                submittingLabel={t('submitting')}
            >
                <BasicFormAlert
                    title={t('applicationSubmittedTitle')}
                    show={isSuccess}
                    variant="default"
                    dismissCallback={dismissCallback}
                />

                <BasicFormAlert
                    title={t('errorOccurred')}
                    description={error?.message || t('unknownError')}
                    variant="destructive"
                    isDismissible={true}
                    autoDismiss={false}
                    show={isError}
                />

                <BasicTextareaField<BecomeTrainerFormValues>
                    name="reason"
                    label={t('reasonLabel')}
                    required
                    placeholder={t('reasonPlaceholder')}
                    control={form.control}
                    rows={10}
                />
            </BasicForm>
        </div>
    );
};
