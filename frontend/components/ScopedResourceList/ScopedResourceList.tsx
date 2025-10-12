'use client';

import { ApiErrorResponse } from '@/types/api';
import { Button } from '../ui/button';
import { ScopedResourceListCard } from './ScopedResourceListCard';

interface Props<T extends { id: number; name: string }> {
    title: string;
    createButtonText: string;
    privateInfo: {
        privateEntities?: T[];
        isLoadingPrivate: boolean;
        errorPrivate: ApiErrorResponse | null;
    };
    publicInfo: {
        publicEntities?: T[];
        isLoadingPublic: boolean;
        errorPublic: ApiErrorResponse | null;
    };
}

export const ScopedResourceList = <T extends { id: number; name: string }>({
    title,
    createButtonText,
    privateInfo: { privateEntities, isLoadingPrivate, errorPrivate },
    publicInfo: { publicEntities, isLoadingPublic, errorPublic },
}: Props<T>) => {
    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">{title}</h1>
                <Button variant="default">{createButtonText}</Button>
            </div>

            <ScopedResourceListCard<T>
                title={`My ${title}`}
                entities={privateEntities}
                isLoading={isLoadingPrivate}
                error={errorPrivate}
                errorLabel={`Error loading private ${title.toLowerCase()}`}
                emptyMessage={`You don't have any private ${title.toLowerCase()} resources yet.`}
            />

            <ScopedResourceListCard<T>
                title={`Public ${title}`}
                entities={publicEntities}
                isLoading={isLoadingPublic}
                error={errorPublic}
                errorLabel={`Error loading public ${title.toLowerCase()}`}
                emptyMessage={`No public ${title.toLowerCase()} available.`}
            />
        </div>
    );
};
