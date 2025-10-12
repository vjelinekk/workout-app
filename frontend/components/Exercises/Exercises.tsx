'use client';

import React from 'react';
import { ScopedResourceList } from '@/components/ScopedResourceList/ScopedResourceList';
import { useExercises } from '@/hooks/useExercises';
import { Exercise } from '@/types/exercise';
import { Scope } from '@/types/scope';

export const Exercises = () => {
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

    return (
        <ScopedResourceList<Exercise>
            title="Exercises"
            createButtonText="Create Exercise"
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
