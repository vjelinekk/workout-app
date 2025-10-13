import { BasicFormAlert } from '@/components/BasicForm/BasicFormAlert';
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';
import { useTranslations } from 'next-intl';

interface Props {
    createError?: string;
    updateError?: string;
    isErrorCreate: boolean;
    isErrorUpdate: boolean;
    isSuccessCreate: boolean;
    isSuccessUpdate: boolean;
}

export const ExerciseFormAlerts = ({
    createError,
    updateError,
    isErrorCreate,
    isErrorUpdate,
    isSuccessCreate,
    isSuccessUpdate,
}: Props) => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.exerciseForm);

    return (
        <>
            <BasicFormAlert
                title={t('creationFailed')}
                show={isErrorCreate}
                autoDismiss={false}
                variant="destructive"
                description={createError}
            />

            <BasicFormAlert
                title={t('updateFailed')}
                show={isErrorUpdate}
                autoDismiss={false}
                variant="destructive"
                description={updateError}
            />

            <BasicFormAlert
                title={t('creationSuccess')}
                show={isSuccessCreate}
                variant="default"
            />

            <BasicFormAlert
                title={t('updateSuccess')}
                show={isSuccessUpdate}
                variant="default"
            />
        </>
    );
};
