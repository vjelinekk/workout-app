'use client';

import { BasicForm } from '@/components/BasicForm/BasicForm';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';
import { ExerciseFormValues } from '@/schemas/exercise';
import { useCreateExercise, useUpdateExercise } from '@/hooks/useExercises';
import { Exercise } from '@/types/exercise';
import { ExerciseFormFields } from './ExerciseFormFields';
import { useExerciseForm } from '@/hooks/useExerciseForm';
import { CreateUpdateAlerts } from '../../BasicForm/CreateUpdateAlerts';
import { useEffect } from 'react';

interface Props {
    mode: 'create' | 'edit' | 'view';
    id?: number;
    initialData?: Exercise;
}

export const ExerciseForm = ({ mode, id, initialData }: Props) => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.exerciseForm);
    const { user } = useAuth();
    const {
        mutate: createExercise,
        isSuccess: isSuccessCreate,
        isError: isErrorCreate,
        error: createError,
    } = useCreateExercise();
    const {
        mutate: updateExercise,
        isSuccess: isSuccessUpdate,
        isError: isErrorUpdate,
        error: updateError,
    } = useUpdateExercise();
    const form = useExerciseForm(initialData);

    useEffect(() => {
        if (isSuccessCreate) {
            form.reset();
        }
    }, [isSuccessCreate, form]);

    const onSubmit = (data: ExerciseFormValues) => {
        const payload = {
            ...data,
            category_id:
                data.category_id === undefined
                    ? undefined
                    : Number(data.category_id),
        } as ExerciseFormValues;

        if (mode === 'edit') {
            if (!initialData || !id) {
                return;
            }

            updateExercise({ id, exercise: payload });
            return;
        }

        createExercise(payload);
    };

    return (
        <div className="mb-10">
            <BasicForm<ExerciseFormValues>
                form={form}
                onSubmit={(data) => onSubmit(data)}
                submitLabel={mode === 'edit' ? t('update') : t('create')}
                submittingLabel={t('creating')}
                isViewMode={mode === 'view'}
            >
                <CreateUpdateAlerts
                    creationFailedTitle={t('creationFailed')}
                    updateFailedTitle={t('updateFailed')}
                    creationSuccessTitle={t('creationSuccess')}
                    updateSuccessTitle={t('updateSuccess')}
                    createError={createError?.message}
                    updateError={updateError?.message}
                    isErrorCreate={isErrorCreate}
                    isErrorUpdate={isErrorUpdate}
                    isSuccessCreate={isSuccessCreate}
                    isSuccessUpdate={isSuccessUpdate}
                />

                <ExerciseFormFields
                    control={form.control}
                    user={user}
                    isViewMode={mode === 'view'}
                />
            </BasicForm>
        </div>
    );
};
