'use client';

import { ApiError } from '@/utils/apiError';
import { Button } from '../ui/button';
import { ScopedResourceListCard } from './ScopedResourceListCard';
import { useTranslations } from 'next-intl';
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';

interface Props<T extends { id: number; name: string }> {
    title: string;
    createButtonText: string;
    detailLink: string;
    privateInfo: {
        privateEntities?: T[];
        isLoadingPrivate: boolean;
        errorPrivate: ApiError | null;
    };
    publicInfo: {
        publicEntities?: T[];
        isLoadingPublic: boolean;
        errorPublic: ApiError | null;
    };
    handleCreate: () => void;
    handleDelete: (id: number) => void;
}

export const ScopedResourceList = <T extends { id: number; name: string }>({
    title,
    createButtonText,
    detailLink,
    privateInfo: { privateEntities, isLoadingPrivate, errorPrivate },
    publicInfo: { publicEntities, isLoadingPublic, errorPublic },
    handleCreate,
    handleDelete,
}: Props<T>) => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.scopedResourceList);

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">{title}</h1>
                <Button onClick={handleCreate} variant="default">
                    {createButtonText}
                </Button>
            </div>

            <ScopedResourceListCard<T>
                title={t('titlePrivate', { resource: title.toLowerCase() })}
                entities={privateEntities}
                isLoading={isLoadingPrivate}
                error={errorPrivate}
                errorLabel={t('errorLoadingPrivate', {
                    resource: title.toLowerCase(),
                })}
                emptyMessage={t('emptyPrivateMessage', {
                    resource: title.toLowerCase(),
                })}
                addDeleteButton
                handleDelete={handleDelete}
                detailLink={detailLink}
            />

            <ScopedResourceListCard<T>
                title={t('titlePublic', { resource: title.toLowerCase() })}
                entities={publicEntities}
                isLoading={isLoadingPublic}
                error={errorPublic}
                errorLabel={t('errorLoadingPublic', {
                    resource: title.toLowerCase(),
                })}
                emptyMessage={t('emptyPublicMessage', {
                    resource: title.toLowerCase(),
                })}
                detailLink={detailLink}
            />
        </div>
    );
};
