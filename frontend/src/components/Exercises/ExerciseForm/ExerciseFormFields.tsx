import { BasicCheckbox } from '@/components/BasicForm/BasicCheckbox';
import { BasicFileInput } from '@/components/BasicForm/BasicFileInput';
import { BasicInputField } from '@/components/BasicForm/BasicInputField';
import { BasicSelectBox } from '@/components/BasicForm/BasicSelectBox';
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';
import { useExerciseCategories } from '@/hooks/useExerciseCategory';
import { ExerciseFormValues } from '@/schemas/exercise';
import { User, UserRole } from '@/types/auth';
import { BodyPart } from '@/types/exercise';
import { useTranslations } from 'next-intl';
import { Control } from 'react-hook-form';
import { ExerciseCategoriesSelectBox } from './ExerciseCategoriesSelectBox';
import { SelectItem } from '@/components/ui/select';

interface Props {
    control: Control<ExerciseFormValues>;
    user: User | null;
    isViewMode?: boolean;
}

export const ExerciseFormFields = ({ control, user, isViewMode }: Props) => {
    const {
        data: exerciseCategories,
        error: categoriesError,
        isLoading: categoriesLoading,
        refetch: refetchCategories,
    } = useExerciseCategories();
    const t = useTranslations(TRANSLATION_SECTION_KEYS.exerciseForm);

    return (
        <>
            <BasicInputField<ExerciseFormValues>
                name="name"
                label={t('name')}
                required
                placeholder={t('placeholder.name')}
                control={control}
                disabled={isViewMode}
            />

            <BasicSelectBox<ExerciseFormValues>
                name="bodyPart"
                label={t('bodyPart')}
                required
                placeholder={t('placeholder.bodyPart')}
                control={control}
                disabled={isViewMode}
            >
                {Object.values(BodyPart).map((part) => (
                    <SelectItem key={part} value={part}>
                        {t(`bodyParts.${part.toLowerCase()}`)}
                    </SelectItem>
                ))}
            </BasicSelectBox>

            <BasicInputField<ExerciseFormValues>
                name="equipment"
                label={t('equipment')}
                required
                placeholder={t('placeholder.equipment')}
                control={control}
                disabled={isViewMode}
            />

            <BasicInputField<ExerciseFormValues>
                name="description"
                label={t('description')}
                required
                placeholder={t('placeholder.description')}
                control={control}
                disabled={isViewMode}
            />

            <ExerciseCategoriesSelectBox
                control={control}
                categoriesLoading={categoriesLoading}
                categoriesError={categoriesError}
                exerciseCategories={exerciseCategories}
                refetchCategories={refetchCategories}
                disabled={isViewMode}
            />

            {!isViewMode && (
                <BasicFileInput<ExerciseFormValues>
                    label={t('imageFile')}
                    control={control}
                    name="imageFile"
                />
            )}

            <BasicCheckbox<ExerciseFormValues>
                control={control}
                name="isPublic"
                label={t('isPublic')}
                disabled={isViewMode}
            />

            {(isViewMode || user?.roles.includes(UserRole.ADMIN)) && (
                <BasicCheckbox<ExerciseFormValues>
                    control={control}
                    name="isApproved"
                    label={t('isApproved')}
                    disabled={isViewMode}
                />
            )}
        </>
    );
};
