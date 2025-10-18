'use client';

import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';
import {
    useDeleteWorkoutSessionPlan,
    useWorkoutSessionPlans,
} from '@/hooks/useWorkoutSessionPlans';
import { Scope } from '@/types/scope';
import { WorkoutSessionPlan } from '@/types/workoutSessionPlan';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ScopedResourceList } from '../ScopedResourceList/ScopedResourceList';

export const WorkoutSessionPlans = () => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.workoutSessionPlansPage);
    const router = useRouter();
    const { mutate: deleteWorkoutSessionPlan } = useDeleteWorkoutSessionPlan();

    const {
        data: privateWorkoutSessionPlans,
        error: privateError,
        isLoading: isLoadingPrivate,
    } = useWorkoutSessionPlans(Scope.MY);
    const {
        data: publicWorkoutSessionPlans,
        error: publicError,
        isLoading: isLoadingPublic,
    } = useWorkoutSessionPlans(Scope.PUBLIC);

    const handleCreate = () => {
        router.push('/plans/create');
    };

    const handleDelete = (id: number) => {
        deleteWorkoutSessionPlan({ id });
    };

    return (
        <ScopedResourceList<WorkoutSessionPlan>
            title={t('title')}
            createButtonText={t('createButton')}
            handleCreate={handleCreate}
            privateInfo={{
                privateEntities: privateWorkoutSessionPlans,
                isLoadingPrivate,
                errorPrivate: privateError,
            }}
            publicInfo={{
                publicEntities: publicWorkoutSessionPlans,
                isLoadingPublic,
                errorPublic: publicError,
            }}
            handleDelete={handleDelete}
            detailLink="plans"
        />
    );
};
