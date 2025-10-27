'use client';

import { BasicForm } from '@/components/BasicForm/BasicForm';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';
import { useEffect } from 'react';
import { CreateUpdateAlerts } from '@/components/BasicForm/CreateUpdateAlerts';
import { Separator } from '@/components/ui/separator';
import { Scope } from '@/types/scope';
import { Spinner } from '@/components/ui/icons/spinner';
import { BasicFormAlert } from '@/components/BasicForm/BasicFormAlert';
import {
    useCreateTrainingSplit,
    useUpdateTrainingSplit,
} from '@/hooks/useTrainingSplits';
import { useTrainingSplitForm } from '@/hooks/useTrainingSplitForm';
import { TrainingSplitFormValues } from '@/schemas/trainingSplit';
import { TrainingSplitFormFields } from './TrainingSplitFormFields';
import { useWorkoutSessionPlans } from '@/hooks/useWorkoutSessionPlans';
import { TrainingSplitDaysFormFields } from '../TrainingSplitDays/TrainingSplitDaysFormFields';
import { TrainingSplit } from '@/types/trainingSplit';

interface Props {
    mode: 'create' | 'edit' | 'view';
    id?: number;
    initialData?: TrainingSplit;
}

export const TrainingSplitForm = ({ mode, id, initialData }: Props) => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.trainingSplitsForm);
    const { user } = useAuth();
    const {
        mutate: createTrainingSplit,
        isSuccess: isSuccessCreate,
        isError: isErrorCreate,
        error: createError,
    } = useCreateTrainingSplit();
    const {
        mutate: updateTrainingSplit,
        isSuccess: isSuccessUpdate,
        isError: isErrorUpdate,
        error: updateError,
    } = useUpdateTrainingSplit();
    const form = useTrainingSplitForm(initialData);
    const {
        data: workoutSessionPlans,
        error: workoutSessionPlansError,
        isLoading: isLoadingWorkoutSessionPlans,
    } = useWorkoutSessionPlans(Scope.AVAILABLE);

    useEffect(() => {
        if (isSuccessCreate) {
            form.reset();
        }
    }, [isSuccessCreate, form]);

    const onSubmit = (data: TrainingSplitFormValues) => {
        if (mode === 'edit') {
            if (!initialData || !id) {
                return;
            }

            updateTrainingSplit({ id, trainingSplit: data });
            return;
        }

        createTrainingSplit(data);
    };

    return (
        <div className="mb-10">
            <BasicForm<TrainingSplitFormValues>
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

                <TrainingSplitFormFields
                    control={form.control}
                    user={user}
                    isViewMode={mode === 'view'}
                />

                <Separator className="my-6" />

                {isLoadingWorkoutSessionPlans && <Spinner />}

                {workoutSessionPlansError && (
                    <BasicFormAlert
                        title={t('errors.workoutSessionPlansFetchError')}
                        show={true}
                        autoDismiss={false}
                        isDismissible={false}
                    />
                )}

                {workoutSessionPlans && workoutSessionPlans.length > 0 && (
                    <TrainingSplitDaysFormFields
                        control={form.control}
                        workoutSessionPlans={workoutSessionPlans}
                        isViewMode={mode === 'view'}
                    />
                )}
            </BasicForm>
        </div>
    );
};
