import { BasicCheckbox } from '@/components/BasicForm/BasicCheckbox';
import { BasicInputField } from '@/components/BasicForm/BasicInputField';
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';
import { User, UserRole } from '@/types/auth';
import { useTranslations } from 'next-intl';
import { Control } from 'react-hook-form';
import { TrainingSplitFormValues } from '@/schemas/trainingSplit';

interface Props {
    control: Control<TrainingSplitFormValues>;
    user: User | null;
    isViewMode?: boolean;
}

export const TrainingSplitFormFields = ({
    control,
    user,
    isViewMode,
}: Props) => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.trainingSplitsForm);

    return (
        <>
            <BasicInputField<TrainingSplitFormValues>
                name="name"
                label={t('name')}
                required
                placeholder={t('placeholder.name')}
                control={control}
                disabled={isViewMode}
            />

            <BasicInputField<TrainingSplitFormValues>
                name="description"
                label={t('description')}
                required
                placeholder={t('placeholder.description')}
                control={control}
                disabled={isViewMode}
            />

            <BasicCheckbox<TrainingSplitFormValues>
                control={control}
                name="isPublic"
                label={t('isPublic')}
                disabled={isViewMode}
            />

            {(isViewMode || user?.roles.includes(UserRole.ADMIN)) && (
                <BasicCheckbox<TrainingSplitFormValues>
                    control={control}
                    name="isApproved"
                    label={t('isApproved')}
                    disabled={isViewMode}
                />
            )}
        </>
    );
};
