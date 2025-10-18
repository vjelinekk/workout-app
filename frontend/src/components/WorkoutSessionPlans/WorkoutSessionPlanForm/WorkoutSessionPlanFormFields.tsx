import { BasicCheckbox } from '@/components/BasicForm/BasicCheckbox';
import { BasicInputField } from '@/components/BasicForm/BasicInputField';
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';
import { User, UserRole } from '@/types/auth';
import { useTranslations } from 'next-intl';
import { Control } from 'react-hook-form';
import { WorkoutSessionPlanFormValues } from '@/schemas/workoutSessionPlan';

interface Props {
    control: Control<WorkoutSessionPlanFormValues>;
    user: User | null;
    isViewMode?: boolean;
}

export const WorkoutSessionPlanFormFields = ({
    control,
    user,
    isViewMode,
}: Props) => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.workoutSessionPlanForm);

    return (
        <>
            <BasicInputField<WorkoutSessionPlanFormValues>
                name="name"
                label={t('name')}
                required
                placeholder={t('placeholder.name')}
                control={control}
                disabled={isViewMode}
            />

            <BasicInputField<WorkoutSessionPlanFormValues>
                name="description"
                label={t('description')}
                required
                placeholder={t('placeholder.description')}
                control={control}
                disabled={isViewMode}
            />

            <BasicCheckbox<WorkoutSessionPlanFormValues>
                control={control}
                name="is_public"
                label={t('isPublic')}
                disabled={isViewMode}
            />

            {(isViewMode || user?.roles.includes(UserRole.ADMIN)) && (
                <BasicCheckbox<WorkoutSessionPlanFormValues>
                    control={control}
                    name="is_approved"
                    label={t('isApproved')}
                    disabled={isViewMode}
                />
            )}
        </>
    );
};
