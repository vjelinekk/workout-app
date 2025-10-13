'use client';

import { ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { useTranslations } from 'next-intl';
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';

interface Props {
    children: ReactNode;
}

export const ErrorBoundaryWrapper = ({ children }: Props) => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.errorBoundary);

    const tryAgain = () => {
        // Reload the page
        if (typeof window !== 'undefined') {
            window.location.reload();
        }
    };

    return (
        <ErrorBoundary
            title={t('title')}
            description={t('description')}
            tryAgainText={t('tryAgain')}
            onTryAgain={tryAgain}
        >
            {children}
        </ErrorBoundary>
    );
};
