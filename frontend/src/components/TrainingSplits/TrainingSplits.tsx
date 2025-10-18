'use client';

import React from 'react';
import { ScopedResourceList } from '@/components/ScopedResourceList/ScopedResourceList';
import { Scope } from '@/types/scope';
import { useTranslations } from 'next-intl';
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';
import { useRouter } from 'next/navigation';
import {
    useDeleteTrainingSplit,
    useTrainingSplits,
} from '@/hooks/useTrainingSplits';
import { TrainingSplit } from '@/types/trainingSplit';

export const TrainingSplits = () => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.trainingSplitsPage);
    const router = useRouter();
    const { mutate: deleteTrainingSplit } = useDeleteTrainingSplit();

    const {
        data: privateTrainingSplits,
        error: privateError,
        isLoading: isLoadingPrivate,
    } = useTrainingSplits(Scope.MY);
    const {
        data: publicTrainingSplits,
        error: publicError,
        isLoading: isLoadingPublic,
    } = useTrainingSplits(Scope.PUBLIC);

    const handleCreate = () => {
        router.push('/splits/create');
    };

    const handleDelete = (id: number) => {
        deleteTrainingSplit({ id });
    };

    return (
        <ScopedResourceList<TrainingSplit>
            title={t('title')}
            createButtonText={t('createButton')}
            handleCreate={handleCreate}
            privateInfo={{
                privateEntities: privateTrainingSplits,
                isLoadingPrivate,
                errorPrivate: privateError,
            }}
            publicInfo={{
                publicEntities: publicTrainingSplits,
                isLoadingPublic,
                errorPublic: publicError,
            }}
            handleDelete={handleDelete}
            detailLink="splits"
        />
    );
};
