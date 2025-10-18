'use client';

import { BasicForm } from '@/components/BasicForm/BasicForm';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';
import { useEffect } from 'react';
import { WorkoutSessionPlan } from '@/types/workoutSessionPlan';
import {
    useCreateWorkoutSessionPlan,
    useUpdateWorkoutSessionPlan,
} from '@/hooks/useWorkoutSessionPlans';
import { useWorkoutSessionForm } from '@/hooks/useWorkoutSessionForm';
import { WorkoutSessionPlanFormValues } from '@/schemas/workoutSessionPlan';
import { CreateUpdateAlerts } from '@/components/BasicForm/CreateUpdateAlerts';
import { WorkoutSessionPlanFormFields } from './WorkoutSessionPlanFormFields';
import { Separator } from '@/components/ui/separator';
import { WorkoutSessionPlanExercisesFormFields } from '../WorkoutSessionPlanExercises/WorkoutSessionPlanExercisesFormFields';
import { useExercises } from '@/hooks/useExercises';
import { Scope } from '@/types/scope';
import { Spinner } from '@/components/ui/icons/spinner';
import { BasicFormAlert } from '@/components/BasicForm/BasicFormAlert';

interface Props {
    mode: 'create' | 'edit' | 'view';
    id?: number;
    initialData?: WorkoutSessionPlan;
}

export const WorkoutSessionPlanForm = ({ mode, id, initialData }: Props) => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.workoutSessionPlanForm);
    const { user } = useAuth();
    const {
        mutate: createWorkoutSessionPlan,
        isSuccess: isSuccessCreate,
        isError: isErrorCreate,
        error: createError,
    } = useCreateWorkoutSessionPlan();
    const {
        mutate: updateWorkoutSessionPlan,
        isSuccess: isSuccessUpdate,
        isError: isErrorUpdate,
        error: updateError,
    } = useUpdateWorkoutSessionPlan();
    const form = useWorkoutSessionForm(initialData);
    const {
        data: exercises,
        isLoading: isLoadingExercises,
        error: exercisesError,
    } = useExercises(Scope.AVAILABLE);

    useEffect(() => {
        if (isSuccessCreate) {
            form.reset();
        }
    }, [isSuccessCreate, form]);

    const onSubmit = (data: WorkoutSessionPlanFormValues) => {
        if (mode === 'edit') {
            if (!initialData || !id) {
                return;
            }

            updateWorkoutSessionPlan({ id, workoutSessionPlan: data });
            return;
        }

        createWorkoutSessionPlan(data);
    };

    return (
        <div className="mb-10">
            <BasicForm<WorkoutSessionPlanFormValues>
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

                <WorkoutSessionPlanFormFields
                    control={form.control}
                    user={user}
                    isViewMode={mode === 'view'}
                />

                <Separator className="my-4" />
                {isLoadingExercises && (
                    <div className="flex justify-center items-center py-8">
                        <Spinner />
                    </div>
                )}
                {exercisesError && (
                    <BasicFormAlert
                        show={true}
                        title={t('exercisesErrorTitle')}
                        description={t('exercisesErrorDescription')}
                        autoDismiss={false}
                        isDismissible={false}
                    />
                )}
                {exercises && exercises.length > 0 && (
                    <WorkoutSessionPlanExercisesFormFields
                        control={form.control}
                        exercises={exercises}
                        isViewMode={mode === 'view'}
                        errors={form.formState.errors}
                    />
                )}
            </BasicForm>
        </div>
    );
};
