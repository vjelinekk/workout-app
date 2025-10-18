'use client';

import React from 'react';
import { ScopedResourceList } from '@/components/ScopedResourceList/ScopedResourceList';
import { useDeleteExercise, useExercises } from '@/hooks/useExercises';
import { Exercise } from '@/types/exercise';
import { Scope } from '@/types/scope';
import { useTranslations } from 'next-intl';
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';
import { useRouter } from 'next/navigation';

export const Exercises = () => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.exercisesPage);
    const router = useRouter();
    const { mutate: deleteExercise } = useDeleteExercise();

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

    const handleDelete = (id: number) => {
        deleteExercise({ id });
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
            handleDelete={handleDelete}
            detailLink="exercises"
        />
    );
};
