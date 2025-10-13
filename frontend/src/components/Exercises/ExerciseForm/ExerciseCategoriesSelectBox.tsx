import { BasicSelectBox } from '@/components/BasicForm/BasicSelectBox';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { SelectItem } from '@/components/ui/select';
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';
import { ExerciseFormValues } from '@/schemas/exercise';
import { ApiErrorResponse } from '@/types/api';
import { ExerciseCategory } from '@/types/exerciseCategory';
import { RefetchOptions, QueryObserverResult } from '@tanstack/react-query';
import { AlertCircleIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Control } from 'react-hook-form';

interface Props {
    control: Control<ExerciseFormValues>;
    categoriesLoading: boolean;
    categoriesError: ApiErrorResponse | null;
    exerciseCategories?: ExerciseCategory[];
    refetchCategories: (
        options?: RefetchOptions,
    ) => Promise<QueryObserverResult<ExerciseCategory[], ApiErrorResponse>>;
    disabled?: boolean;
}

export const ExerciseCategoriesSelectBox = ({
    control,
    categoriesLoading,
    categoriesError,
    exerciseCategories,
    refetchCategories,
    disabled,
}: Props) => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.exerciseForm);

    return (
        <>
            <BasicSelectBox<ExerciseFormValues>
                name="category_id"
                label={t('category')}
                placeholder={
                    categoriesLoading ? 'Loading...' : t('placeholder.category')
                }
                control={control}
                disabled={categoriesLoading || !!categoriesError || disabled}
                valueType="number"
            >
                {exerciseCategories?.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                    </SelectItem>
                ))}
            </BasicSelectBox>

            {categoriesError && (
                <div className="mb-4">
                    <Alert variant="destructive">
                        <AlertCircleIcon />
                        <AlertTitle>{t('unexpectedCategoryError')}</AlertTitle>
                    </Alert>

                    <div className="mt-2">
                        <Button onClick={() => void refetchCategories()}>
                            {t('retryLoadingCategories')}
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
};
