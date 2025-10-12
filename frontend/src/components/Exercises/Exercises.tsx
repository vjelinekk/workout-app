'use client';

import React from 'react';
import { ScopedResourceList } from '@/components/ScopedResourceList/ScopedResourceList';
import { useExercises } from '@/hooks/useExercises';
import { Exercise } from '@/types/exercise';
import { Scope } from '@/types/scope';
import { useTranslations } from 'next-intl';
import { SECTION_KEYS } from '@/constants/locale';
import { useRouter } from 'next/navigation';

export const Exercises = () => {
    const t = useTranslations(SECTION_KEYS.exercisesPage);
    const router = useRouter();

    const {
        data: privateExercises,
        error: privateError,
        isLoading: isLoadingPrivate,
    } = useExercises(Scope.MY);
    const {
        data: publicExercises,
        error: publicError,
        isLoading: isLoadingPublic,
    } = useExercises(Scope.PUBLIC);

    const handleCreate = () => {
        router.push('/exercises/create');
    };

    return (
        <ScopedResourceList<Exercise>
            title={t('title')}
            createButtonText={t('createButton')}
            handleCreate={handleCreate}
            privateInfo={{
                privateEntities: privateExercises,
                isLoadingPrivate,
                errorPrivate: privateError,
            }}
            publicInfo={{
                publicEntities: publicExercises,
                isLoadingPublic,
                errorPublic: publicError,
            }}
        />
    );
};
